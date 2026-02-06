import { Request, Response, NextFunction } from "express";
import prisma from "@config/database";
import { ok } from "@utils/response";
import { AppError } from "@utils/errors";
import perfectCorpService from "@services/perfectcorp.service";
import PerfectCorpMock from "@utils/perfectcorp-mock";
import env from "@config/env";

export class FavoriteController {
  static async getAllFavorites(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401);
      }

      const page = parseInt(String(req.query.page)) || 1;
      const limit = parseInt(String(req.query.limit)) || 20;
      const category = (req.query.category as string) || undefined;
      const skip = (page - 1) * limit;

      const where: any = { userId: req.user.userId };
      if (category) where.productCategory = category;

      const [favorites, total] = await Promise.all([
        prisma.favorite.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take: limit
        }),
        prisma.favorite.count({ where })
      ]);

      ok(res, {
        message: "Favorites retrieved successfully",
        data: {
          favorites,
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

  static async addFavorite(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401);
      }

      const {
        productId,
        productName,
        productBrand,
        productCategory,
        productImageUrl,
        price,
        notes,
        tags
      } = req.body as {
        productId: string;
        productName?: string;
        productBrand?: string;
        productCategory?: string;
        productImageUrl?: string;
        price?: number;
        notes?: string;
        tags?: string[];
      };

      const existing = await prisma.favorite.findUnique({
        where: {
          userId_productId: {
            userId: req.user.userId,
            productId
          }
        }
      });

      if (existing) {
        throw new AppError("Product already in favorites", 400);
      }

      const favorite = await prisma.favorite.create({
        data: {
          userId: req.user.userId,
          productId,
          productName: productName || "Favorite",
          productBrand,
          productCategory,
          productImageUrl,
          price,
          notes,
          tags: tags || []
        }
      });

      await prisma.userProfile.update({
        where: { userId: req.user.userId },
        data: {
          favoriteProducts: { increment: 1 }
        }
      });

      ok(
        res,
        {
          message: "Added to favorites successfully",
          data: { favorite }
        },
        201
      );
    } catch (error) {
      next(error);
    }
  }

  static async removeFavorite(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401);
      }

      const { productId } = req.params as { productId: string };

      const favorite = await prisma.favorite.findUnique({
        where: {
          userId_productId: {
            userId: req.user.userId,
            productId
          }
        }
      });

      if (!favorite) {
        throw new AppError("Favorite not found", 404);
      }

      await prisma.favorite.delete({
        where: {
          userId_productId: {
            userId: req.user.userId,
            productId
          }
        }
      });

      await prisma.userProfile.update({
        where: { userId: req.user.userId },
        data: {
          favoriteProducts: { decrement: 1 }
        }
      });

      ok(res, {
        message: "Removed from favorites successfully"
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateFavorite(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401);
      }

      const { productId } = req.params as { productId: string };
      const { notes, tags } = req.body as { notes?: string; tags?: string[] };

      const favorite = await prisma.favorite.update({
        where: {
          userId_productId: {
            userId: req.user.userId,
            productId
          }
        },
        data: {
          notes,
          tags: tags || undefined
        }
      });

      ok(res, {
        message: "Favorite updated successfully",
        data: { favorite }
      });
    } catch (error) {
      next(error);
    }
  }

  static async searchProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { q, category, skinType, limit } = req.query as Record<string, string>;

      let products;
      if (!env.perfectCorp.apiKey || env.perfectCorp.apiKey.toLowerCase() === "mock") {
        products = PerfectCorpMock.mockRecommendations();
      } else {
        products = await perfectCorpService.searchProducts({
          keyword: q,
          category,
          skinType,
          limit: limit ? parseInt(limit, 10) : 20
        });
      }

      ok(res, {
        message: "Products retrieved successfully",
        data: { products }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getRecommendations(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401);
      }

      const profile = await prisma.userProfile.findUnique({
        where: { userId: req.user.userId }
      });

      let recommendations;
      if (!env.perfectCorp.apiKey || env.perfectCorp.apiKey.toLowerCase() === "mock") {
        recommendations = PerfectCorpMock.mockRecommendations();
      } else {
        recommendations = await perfectCorpService.searchProducts({
          skinType: profile?.skinType || undefined,
          limit: 10
        });
      }

      ok(res, {
        message: "Recommendations retrieved successfully",
        data: { recommendations }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default FavoriteController;
