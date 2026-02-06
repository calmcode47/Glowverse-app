import rateLimit from "express-rate-limit";
import env from "@config/env";

export const apiLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.maxRequests,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many authentication attempts, please try again later.",
  skipSuccessfulRequests: true
});

export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: "Too many uploads, please try again later."
});

export const perfectCorpLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: "Perfect Corp API rate limit exceeded, please try again later."
});

export default {
  apiLimiter,
  authLimiter,
  uploadLimiter,
  perfectCorpLimiter
};
