import { Response } from "express";
import { ApiResponse } from "@app-types/api.types";

export const sendSuccess = <T = any>(
  res: Response,
  options: {
    message: string;
    data?: T;
    statusCode?: number;
  },
  statusCode?: number
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message: options.message,
    data: options.data,
    timestamp: new Date().toISOString()
  };

  return res.status(statusCode || options.statusCode || 200).json(response);
};

export const sendError = (
  res: Response,
  options: {
    message: string;
    error?: string;
    statusCode?: number;
  }
): Response => {
  const response: ApiResponse = {
    success: false,
    message: options.message,
    error: options.error,
    timestamp: new Date().toISOString()
  };

  return res.status(options.statusCode || 500).json(response);
};

export default {
  sendSuccess,
  sendError
};

export function ok(res: Response, data: unknown, status = 200) {
  res.status(status).json({ data });
}

export function fail(res: Response, error: string, status = 400) {
  res.status(status).json({ error });
}
