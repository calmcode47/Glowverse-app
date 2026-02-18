import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { randomUUID, randomBytes, createHash } from "crypto";
import { User } from "@prisma/client";
import prisma from "@config/database";
import env from "@config/env";
import { AppError } from "@utils/errors";
import { EnhancedNotificationService } from "./enhancedNotification.service";
import logger from "@utils/logger";

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  static generateAccessToken(payload: JwtPayload): string {
    return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn } as SignOptions);
  }

  static generateRefreshToken(payload: JwtPayload): string {
    return jwt.sign(
      payload,
      env.jwtRefreshSecret,
      { expiresIn: env.jwtRefreshExpiresIn, jwtid: randomUUID() } as SignOptions
    );
  }

  static verifyAccessToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, env.jwtSecret) as JwtPayload;
    } catch {
      throw new AppError("Invalid or expired token", 401);
    }
  }

  static verifyRefreshToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, env.jwtRefreshSecret) as JwtPayload;
    } catch {
      throw new AppError("Invalid or expired refresh token", 401);
    }
  }

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static async register(data: { email: string; password: string; name?: string }): Promise<{ user: User; tokens: AuthTokens }> {
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      throw new AppError("User with this email already exists", 400);
    }

    const hashedPassword = await this.hashPassword(data.password);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        profile: { create: {} },
        notificationPreferences: { create: {} }
      },
      include: { profile: true, notificationPreferences: true }
    });

    const tokens = await this.generateTokens(user);

    // Send Welcome Email
    await EnhancedNotificationService.sendWelcome(user.id, user.email, user.name || 'User').catch(err => {
      logger.error('Failed to send welcome email:', err);
    });

    return { user, tokens };
  }

  static async login(data: { email: string; password: string }): Promise<{ user: User; tokens: AuthTokens }> {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: { profile: true }
    });
    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }
    if (!user.isActive) {
      throw new AppError("Your account has been deactivated", 403);
    }
    const isPasswordValid = await this.comparePassword(data.password, user.password);
    if (!isPasswordValid) {
      throw new AppError("Invalid email or password", 401);
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });
    const tokens = await this.generateTokens(user);
    return { user, tokens };
  }

  static async generateTokens(user: User): Promise<AuthTokens> {
    const payload: JwtPayload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);
    const expiresAt = new Date();
    const days = parseInt(env.jwtRefreshExpiresIn.replace("d", ""), 10);
    expiresAt.setDate(expiresAt.getDate() + days);
    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt }
    });
    return { accessToken, refreshToken };
  }

  static async refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
    const payload = this.verifyRefreshToken(refreshToken);
    void payload;
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true }
    });
    if (!storedToken) {
      throw new AppError("Invalid refresh token", 401);
    }
    if (storedToken.expiresAt < new Date()) {
      await prisma.refreshToken.delete({ where: { token: refreshToken } });
      throw new AppError("Refresh token expired", 401);
    }
    await prisma.refreshToken.delete({ where: { token: refreshToken } });
    const tokens = await this.generateTokens(storedToken.user);
    return tokens;
  }

  static async logout(refreshToken: string): Promise<void> {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  }

  static async logoutAll(userId: string): Promise<void> {
    await prisma.refreshToken.deleteMany({ where: { userId } });
  }

  static async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError("User not found", 404);
    }
    const isPasswordValid = await this.comparePassword(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new AppError("Invalid old password", 401);
    }
    const hashedPassword = await this.hashPassword(newPassword);
    await prisma.user.update({ where: { id: userId }, data: { password: hashedPassword } });
    await this.logoutAll(userId);
  }

  static async deleteAccount(userId: string, password: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError("User not found", 404);
    }
    const isPasswordValid = await this.comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new AppError("Invalid password", 401);
    }
    await prisma.user.delete({ where: { id: userId } });
  }

  /**
   * Request password reset — generates a secure token, hashes it,
   * stores the hash in the DB, and emails the plain token to the user.
   */
  static async requestPasswordReset(email: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal user existence
      return;
    }

    // Generate secure random token
    const resetToken = randomBytes(32).toString("hex");

    // Hash the token before storing (never store plain tokens)
    const hashedToken = createHash("sha256").update(resetToken).digest("hex");

    // Set expiry (1 hour from now)
    const resetTokenExpiry = new Date(Date.now() + 3600000);

    // Store hashed token in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: hashedToken,
        resetTokenExpiry,
      },
    });

    logger.info("Password reset token generated", {
      userId: user.id,
      email: user.email,
      expiresAt: resetTokenExpiry,
    });

    // Send reset email with the plain token (not the hash)
    await EnhancedNotificationService.sendPasswordReset(
      user.email,
      user.name || "User",
      resetToken
    ).catch((err) => {
      logger.error("Failed to send password reset email:", err);
    });
  }

  /**
   * Reset password using a valid reset token.
   */
  static async resetPassword(token: string, newPassword: string): Promise<void> {
    // Hash the provided token to match against the stored hash
    const hashedToken = createHash("sha256").update(token).digest("hex");

    const user = await prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExpiry: { gte: new Date() },
      },
    });

    if (!user) {
      throw new AppError("Invalid or expired reset token", 400);
    }

    const hashedPassword = await this.hashPassword(newPassword);

    // Update password and clear reset token (single-use)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    // Invalidate all existing sessions
    await this.logoutAll(user.id);

    logger.info("Password reset successful", { userId: user.id, email: user.email });
  }

  /**
   * Verify reset token validity without resetting the password.
   */
  static async verifyResetToken(token: string): Promise<{ valid: boolean; email?: string }> {
    const hashedToken = createHash("sha256").update(token).digest("hex");

    const user = await prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExpiry: { gte: new Date() },
      },
      select: { id: true, email: true },
    });

    if (!user) {
      return { valid: false };
    }

    return { valid: true, email: user.email };
  }

  /**
   * Clean up expired reset tokens. Intended to run as a scheduled job.
   */
  static async cleanupExpiredTokens(): Promise<number> {
    const result = await prisma.user.updateMany({
      where: {
        resetTokenExpiry: { lt: new Date() },
        resetToken: { not: null },
      },
      data: {
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    if (result.count > 0) {
      logger.info("Expired reset tokens cleaned up", { count: result.count });
    }

    return result.count;
  }
}

export default AuthService;

