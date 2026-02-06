import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { User, UserRole } from "@prisma/client";
import prisma from "@config/database";
import env from "@config/env";
import { AppError } from "@utils/errors";

interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
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
    return jwt.sign(payload, env.jwtRefreshSecret, { expiresIn: env.jwtRefreshExpiresIn } as SignOptions);
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
        profile: { create: {} }
      },
      include: { profile: true }
    });

    const tokens = await this.generateTokens(user);
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
}

export default AuthService;
