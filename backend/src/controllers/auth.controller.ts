import { Request, Response } from "express";
import prisma from "@config/database";
import AuthService from "@services/auth.service";
import { AppError } from "@utils/errors";

const AuthController = {
  async register(req: Request, res: Response) {
    const { email, password, name } = req.body as { email: string; password: string; name?: string };
    const { user, tokens } = await AuthService.register({ email, password, name });
    return res.status(201).json({ user, tokens });
  },

  async login(req: Request, res: Response) {
    const { email, password } = req.body as { email: string; password: string };
    const { user, tokens } = await AuthService.login({ email, password });
    return res.status(200).json({ user, tokens });
  },

  async refreshToken(req: Request, res: Response) {
    const { refreshToken } = req.body as { refreshToken: string };
    if (!refreshToken) {
      throw new AppError("Refresh token is required", 400);
    }
    const tokens = await AuthService.refreshAccessToken(refreshToken);
    return res.status(200).json(tokens);
  },

  async logout(req: Request, res: Response) {
    const { refreshToken } = req.body as { refreshToken?: string };
    if (refreshToken) {
      await AuthService.logout(refreshToken);
    }
    return res.status(200).json({ message: "Logged out successfully" });
  },

  async logoutAll(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }
    await AuthService.logoutAll(req.user.userId);
    return res.status(200).json({ message: "Logged out from all devices" });
  },

  async getProfile(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { profile: true }
    });
    return res.status(200).json({ user });
  },

  async changePassword(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }
    const { oldPassword, newPassword } = req.body as { oldPassword: string; newPassword: string };
    await AuthService.changePassword(req.user.userId, oldPassword, newPassword);
    return res.status(200).json({ message: "Password changed successfully" });
  },

  async deleteAccount(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }
    const { password } = req.body as { password: string };
    await AuthService.deleteAccount(req.user.userId, password);
    return res.status(200).json({ message: "Account deleted successfully" });
  }
};

export default AuthController;
