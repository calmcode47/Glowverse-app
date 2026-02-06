import { Request, Response, NextFunction } from "express";
import { AuthService } from "@services/auth.service";
import { AppError } from "@utils/errors";
import { UserRole } from "@prisma/client";

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  void res;
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("No token provided", 401);
    }
    const token = authHeader.substring(7);
    const payload = AuthService.verifyAccessToken(token);
    req.user = { userId: payload.userId, email: payload.email, role: payload.role };
    return next();
  } catch (error) {
    return next(error);
  }
};

export const optionalAuthenticate = async (req: Request, res: Response, next: NextFunction) => {
  void res;
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const payload = AuthService.verifyAccessToken(token);
      req.user = { userId: payload.userId, email: payload.email, role: payload.role };
    }
    return next();
  } catch {
    return next();
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    void res;
    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }
    if (!req.user.role || !roles.includes(req.user.role)) {
      return next(new AppError("You do not have permission to perform this action", 403));
    }
    return next();
  };
};

export const checkOwnership = (resourceUserIdField: string = "userId") => {
  return (req: Request, res: Response, next: NextFunction) => {
    void res;
    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }
    if (req.user.role === UserRole.ADMIN) {
      return next();
    }
    const resourceUserId = (req.params as any)[resourceUserIdField] || (req.body as any)[resourceUserIdField];
    if (resourceUserId && resourceUserId !== req.user.userId) {
      return next(new AppError("You do not have permission to access this resource", 403));
    }
    return next();
  };
};

export default {
  authenticate,
  optionalAuthenticate,
  authorize,
  checkOwnership
};
