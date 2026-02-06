import { Request, Response, NextFunction } from "express";
import { AppError } from "@utils/errors";
import { sendError } from "@utils/response";
import env from "@config/env";

export const errorHandler = (err: Error | AppError, req: Request, res: Response, next: NextFunction) => {
  void next;
  console.error("Error:", {
    message: err.message,
    stack: env.nodeEnv === "development" ? err.stack : undefined,
    path: req.path,
    method: req.method
  });

  if (err instanceof AppError) {
    return sendError(res, {
      message: err.message,
      error: err.errors || (env.nodeEnv === "development" ? err.stack : undefined),
      statusCode: err.statusCode
    });
  }

  if (err.name === "PrismaClientKnownRequestError") {
    return sendError(res, {
      message: "Database operation failed",
      error: env.nodeEnv === "development" ? err.message : undefined,
      statusCode: 400
    });
  }

  if (err.name === "JsonWebTokenError") {
    return sendError(res, { message: "Invalid token", statusCode: 401 });
  }

  if (err.name === "TokenExpiredError") {
    return sendError(res, { message: "Token expired", statusCode: 401 });
  }

  if (err.name === "MulterError") {
    return sendError(res, { message: "File upload error", error: (err as any).message, statusCode: 400 });
  }

  return sendError(res, {
    message: "Internal server error",
    error: env.nodeEnv === "development" ? err.message : undefined,
    statusCode: 500
  });
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  void res;
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

export default {
  errorHandler,
  notFoundHandler
};
