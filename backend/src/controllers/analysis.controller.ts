import { Request, Response, NextFunction } from "express";
import prisma from "@config/database";
import { AppError } from "@utils/errors";
import ImageService from "@services/image.service";
import StorageService from "@services/storage.service";
import perfectCorpService from "@services/perfectcorp.service";
import PerfectCorpMock from "@utils/perfectcorp-mock";
import env from "@config/env";
import { AnalysisStatus, AnalysisType } from "@prisma/client";

const AnalysisController = {
  async createSkinAnalysis(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401);
      }
      const file = req.file;
      if (!file) {
        throw new AppError("No image uploaded", 400);
      }
      await ImageService.validateImage(file.buffer);
      const uploadResult = await StorageService.uploadImage(file, "analysis");
      const analysis = await prisma.analysis.create({
        data: {
          userId: req.user.userId,
          type: AnalysisType.SKIN_ANALYSIS,
          status: AnalysisStatus.PROCESSING,
          originalImageUrl: uploadResult.secureUrl,
          originalImagePublicId: uploadResult.publicId
        }
      });
      void AnalysisController.processAnalysis(analysis.id, uploadResult.secureUrl).catch((error) => {
        console.error("Analysis processing error:", error);
      });
      return res.status(202).json({ analysis });
    } catch (error) {
      return next(error);
    }
  },

  async processAnalysis(analysisId: string, imageUrl: string): Promise<void> {
    const startTime = Date.now();
    try {
      let result;
      if (!env.perfectCorp.apiKey || env.perfectCorp.apiKey.toLowerCase() === "mock") {
        await PerfectCorpMock.delay(3000);
        result = PerfectCorpMock.mockSkinAnalysis();
      } else {
        result = await perfectCorpService.analyzeSkin({ imageUrl });
      }
      const processingTime = Date.now() - startTime;
      await prisma.analysis.update({
        where: { id: analysisId },
        data: {
          status: AnalysisStatus.COMPLETED,
          results: result as any,
          processingTime
        }
      });
      await prisma.userProfile.update({
        where: { userId: (await prisma.analysis.findUnique({ where: { id: analysisId } }))!.userId },
        data: { totalAnalyses: { increment: 1 } }
      });
    } catch (error: any) {
      await prisma.analysis.update({
        where: { id: analysisId },
        data: {
          status: AnalysisStatus.FAILED,
          errorMessage: error.message || "Analysis failed",
          processingTime: Date.now() - startTime
        }
      });
      throw error;
    }
  },

  async getAllAnalyses(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }
    const page = parseInt(String(req.query.page)) || 1;
    const limit = parseInt(String(req.query.limit)) || 10;
    const type = (req.query.type as string) || undefined;
    const status = (req.query.status as string) || undefined;
    const skip = (page - 1) * limit;
    const where: any = { userId: req.user.userId };
    if (type) where.type = type;
    if (status) where.status = status;
    const [analyses, total] = await Promise.all([
      prisma.analysis.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      prisma.analysis.count({ where })
    ]);
    return res.status(200).json({
      analyses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  },

  async getAnalysis(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }
    const { id } = req.params as { id: string };
    const analysis = await prisma.analysis.findFirst({
      where: { id, userId: req.user.userId }
    });
    if (!analysis) {
      throw new AppError("Analysis not found", 404);
    }
    return res.status(200).json({ analysis });
  },

  async getRecommendations(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }
    const { id } = req.params as { id: string };
    const analysis = await prisma.analysis.findFirst({ where: { id, userId: req.user.userId } });
    if (!analysis) {
      throw new AppError("Analysis not found", 404);
    }
    let recommendations;
    if (!env.perfectCorp.apiKey || env.perfectCorp.apiKey.toLowerCase() === "mock") {
      recommendations = PerfectCorpMock.mockRecommendations();
    } else {
      recommendations = await perfectCorpService.getRecommendations(id, { limit: 10 });
    }
    return res.status(200).json({ recommendations });
  },

  async deleteAnalysis(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }
    const { id } = req.params as { id: string };
    const analysis = await prisma.analysis.findFirst({ where: { id, userId: req.user.userId } });
    if (!analysis) {
      throw new AppError("Analysis not found", 404);
    }
    if (analysis.originalImagePublicId) {
      await StorageService.deleteImage(analysis.originalImagePublicId);
    }
    if (analysis.processedImagePublicId) {
      await StorageService.deleteImage(analysis.processedImagePublicId);
    }
    await prisma.analysis.delete({ where: { id } });
    return res.status(200).json({ message: "Analysis deleted successfully" });
  }
};

export default AnalysisController;
