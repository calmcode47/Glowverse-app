import { Request, Response } from "express";
import prisma from "@config/database";
import { AppError } from "@utils/errors";
import StorageService from "@services/storage.service";
import ImageService from "@services/image.service";

const UserController = {
  async updateProfile(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }
    const { name, phoneNumber, dateOfBirth, gender } = req.body as {
      name?: string;
      phoneNumber?: string;
      dateOfBirth?: string;
      gender?: string;
    };
    if (name !== undefined) {
      await prisma.user.update({ where: { id: req.user.userId }, data: { name } });
    }
    await prisma.userProfile.upsert({
      where: { userId: req.user.userId },
      update: {
        phoneNumber,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        gender: gender as any
      },
      create: {
        userId: req.user.userId,
        phoneNumber,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        gender: gender as any
      }
    });
    const user = await prisma.user.findUnique({ where: { id: req.user.userId }, include: { profile: true } });
    return res.status(200).json({ user });
  },

  async updatePreferences(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }
    const { skinType, skinTone, preferences } = req.body as { skinType?: string; skinTone?: string; preferences?: unknown };
    await prisma.userProfile.upsert({
      where: { userId: req.user.userId },
      update: {
        skinType,
        skinTone,
        preferences: preferences as any
      },
      create: {
        userId: req.user.userId,
        skinType,
        skinTone,
        preferences: preferences as any
      }
    });
    const user = await prisma.user.findUnique({ where: { id: req.user.userId }, include: { profile: true } });
    return res.status(200).json({ user });
  },

  async uploadAvatar(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }
    const file = req.file;
    if (!file) {
      throw new AppError("No avatar file provided", 400);
    }
    await ImageService.validateImage(file.buffer);
    const compressed = await ImageService.compressImage(file.buffer, 80);
    (file as any).buffer = compressed;
    const result = await StorageService.uploadImage(file, "avatars");
    await prisma.user.update({
      where: { id: req.user.userId },
      data: { avatar: result.secureUrl }
    });
    return res.status(200).json({ avatarUrl: result.secureUrl });
  },

  async getStats(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }
    const [analyses, tryOns, favorites, profile] = await Promise.all([
      prisma.analysis.count({ where: { userId: req.user.userId } }),
      prisma.virtualTryOn.count({ where: { userId: req.user.userId } }),
      prisma.favorite.count({ where: { userId: req.user.userId } }),
      prisma.userProfile.findUnique({ where: { userId: req.user.userId } })
    ]);
    return res.status(200).json({
      analyses,
      tryOns,
      favorites,
      totals: {
        totalAnalyses: profile?.totalAnalyses || analyses,
        totalTryOns: profile?.totalTryOns || tryOns,
        favoriteProducts: profile?.favoriteProducts || favorites
      }
    });
  },

  async getHistory(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }
    const [analyses, tryOns] = await Promise.all([
      prisma.analysis.findMany({
        where: { userId: req.user.userId },
        orderBy: { createdAt: "desc" },
        take: 50
      }),
      prisma.virtualTryOn.findMany({
        where: { userId: req.user.userId },
        orderBy: { createdAt: "desc" },
        take: 50
      })
    ]);
    return res.status(200).json({ analyses, tryOns });
  },

  async deleteHistoryItem(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }
    const { id } = req.params as { id: string };
    const analysis = await prisma.analysis.findFirst({ where: { id, userId: req.user.userId } });
    if (analysis) {
      if (analysis.originalImagePublicId) {
        await StorageService.deleteImage(analysis.originalImagePublicId);
      }
      if (analysis.processedImagePublicId) {
        await StorageService.deleteImage(analysis.processedImagePublicId);
      }
      await prisma.analysis.delete({ where: { id } });
      return res.status(200).json({ message: "Analysis deleted" });
    }
    const tryOn = await prisma.virtualTryOn.findFirst({ where: { id, userId: req.user.userId } });
    if (tryOn) {
      if (tryOn.originalImagePublicId) {
        await StorageService.deleteImage(tryOn.originalImagePublicId);
      }
      if (tryOn.resultImagePublicId) {
        await StorageService.deleteImage(tryOn.resultImagePublicId);
      }
      await prisma.virtualTryOn.delete({ where: { id } });
      return res.status(200).json({ message: "Try-on deleted" });
    }
    throw new AppError("History item not found", 404);
  }
};

export default UserController;
