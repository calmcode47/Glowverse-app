import { Request, Response, NextFunction } from "express";
import prisma from "@config/database";
import { ok } from "@utils/response";
import { AppError } from "@utils/errors";
import { StorageService } from "@services/storage.service";
import ImageService from "@services/image.service";
import perfectCorpService from "@services/perfectcorp.service";
import PerfectCorpMock from "@utils/perfectcorp-mock";
import env from "@config/env";
import { TryOnType, TryOnStatus } from "@prisma/client";

export class TryOnController {
  static async createTryOn(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401);
      }

      if (!req.file) {
        throw new AppError("No image uploaded", 400);
      }

      const { type, productId, productName, productBrand, intensity } = req.body as {
        type: TryOnType;
        productId?: string;
        productName?: string;
        productBrand?: string;
        intensity?: string | number;
      };

      if (!Object.values(TryOnType).includes(type)) {
        throw new AppError("Invalid try-on type", 400);
      }

      await ImageService.validateImage(req.file.buffer);

      const uploadResult = await StorageService.uploadImage(req.file, "tryons");

      const tryOn = await prisma.virtualTryOn.create({
        data: {
          userId: req.user.userId,
          type,
          status: TryOnStatus.PROCESSING,
          originalImageUrl: uploadResult.secureUrl,
          originalImagePublicId: uploadResult.publicId,
          productId,
          productName,
          productBrand,
          intensity: intensity ? parseFloat(String(intensity)) : 1.0
        }
      });

      void TryOnController.processTryOn(tryOn.id, uploadResult.secureUrl, {
        type,
        productId,
        intensity: intensity ? parseFloat(String(intensity)) : 1.0
      }).catch((error) => {
        console.error("Try-on processing error:", error);
      });

      ok(
        res,
        {
          message: "Virtual try-on started successfully",
          data: { tryOn }
        },
        202
      );
    } catch (error) {
      next(error);
    }
  }

  private static async processTryOn(
    tryOnId: string,
    imageUrl: string,
    options: {
      type: TryOnType;
      productId?: string;
      intensity?: number;
    }
  ): Promise<void> {
    const startTime = Date.now();
    try {
      let result;

      if (!env.perfectCorp.apiKey || env.perfectCorp.apiKey.toLowerCase() === "mock") {
        await PerfectCorpMock.delay(3000);
        result = PerfectCorpMock.mockVirtualTryOn();
      } else {
        result = await perfectCorpService.applyVirtualMakeup({
          imageUrl,
          productId: options.productId || "",
          productType: options.type as any,
          intensity: options.intensity
        });
      }

      const processingTime = Date.now() - startTime;

      await prisma.virtualTryOn.update({
        where: { id: tryOnId },
        data: {
          status: TryOnStatus.COMPLETED,
          resultImageUrl: result.resultImageUrl,
          results: result as any,
          processingTime
        }
      });

      const tryOn = await prisma.virtualTryOn.findUnique({ where: { id: tryOnId } });
      if (tryOn) {
        await prisma.userProfile.update({
          where: { userId: tryOn.userId },
          data: {
            totalTryOns: { increment: 1 }
          }
        });
      }
    } catch (error: any) {
      await prisma.virtualTryOn.update({
        where: { id: tryOnId },
        data: {
          status: TryOnStatus.FAILED,
          errorMessage: error.message || "Try-on failed",
          processingTime: Date.now() - startTime
        }
      });
      throw error;
    }
  }

  static async getTryOn(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401);
      }

      const { id } = req.params as { id: string };

      const tryOn = await prisma.virtualTryOn.findFirst({
        where: {
          id,
          userId: req.user.userId
        }
      });

      if (!tryOn) {
        throw new AppError("Try-on not found", 404);
      }

      ok(res, {
        message: "Try-on retrieved successfully",
        data: { tryOn }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllTryOns(req: Request, res: Response, next: NextFunction) {
    try {
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

      const [tryOns, total] = await Promise.all([
        prisma.virtualTryOn.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
          select: {
            id: true,
            type: true,
            status: true,
            originalImageUrl: true,
            resultImageUrl: true,
            productName: true,
            productBrand: true,
            intensity: true,
            errorMessage: true,
            createdAt: true
          }
        }),
        prisma.virtualTryOn.count({ where })
      ]);

      ok(res, {
        message: "Try-ons retrieved successfully",
        data: {
          tryOns,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteTryOn(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401);
      }

      const { id } = req.params as { id: string };

      const tryOn = await prisma.virtualTryOn.findFirst({
        where: {
          id,
          userId: req.user.userId
        }
      });

      if (!tryOn) {
        throw new AppError("Try-on not found", 404);
      }

      if (tryOn.originalImagePublicId) {
        await StorageService.deleteImage(tryOn.originalImagePublicId);
      }
      if (tryOn.resultImagePublicId) {
        await StorageService.deleteImage(tryOn.resultImagePublicId);
      }

      await prisma.virtualTryOn.delete({ where: { id } });

      ok(res, {
        message: "Try-on deleted successfully"
      });
    } catch (error) {
      next(error);
    }
  }

  static async saveFavorite(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401);
      }

      const { id } = req.params as { id: string };

      const tryOn = await prisma.virtualTryOn.findFirst({
        where: {
          id,
          userId: req.user.userId,
          status: TryOnStatus.COMPLETED
        }
      });

      if (!tryOn) {
        throw new AppError("Try-on not found or not completed", 404);
      }

      const existing = await prisma.favorite.findFirst({
        where: {
          userId: req.user.userId,
          productId: tryOn.productId || id
        }
      });

      if (existing) {
        throw new AppError("Already in favorites", 400);
      }

      const favorite = await prisma.favorite.create({
        data: {
          userId: req.user.userId,
          productId: tryOn.productId || id,
          productName: tryOn.productName || "Virtual Try-On",
          productBrand: tryOn.productBrand || undefined,
          productCategory: tryOn.type,
          productImageUrl: tryOn.resultImageUrl || undefined
        }
      });

      ok(res, {
        message: "Added to favorites successfully",
        data: { favorite }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default TryOnController;
