import { Request, Response } from "express";
import prisma from "@config/database";
import AuthService from "@services/auth.service";
import { AppError } from "@utils/errors";
import { DDoSProtection } from "../middleware/ddos-protection";
import { IPReputationService } from "../services/ip-reputation.service";

const AuthController = {
  async register(req: Request, res: Response) {
    const { email, password, name } = req.body as { email: string; password: string; name?: string };
    const { user, tokens } = await AuthService.register({ email, password, name });
    return res.status(201).json({ user, tokens });
  },

  async login(req: Request, res: Response) {
    const { email, password } = req.body as { email: string; password: string };
    const ip = req.ip || 'unknown';

    try {
      const { user, tokens } = await AuthService.login({ email, password });

      // Successful login - improve reputation and clear failed attempts
      await IPReputationService.updateReputation(ip, 'good', 1);

      return res.status(200).json({ user, tokens });
    } catch (error) {
      // Track failed attempt
      await DDoSProtection.trackFailedAuth(ip);
      await IPReputationService.updateReputation(ip, 'bad', 2);
      throw error;
    }
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
  },

  async forgotPassword(req: Request, res: Response) {
    const { email } = req.body as { email: string };
    await AuthService.requestPasswordReset(email);
    // Always return success to prevent email enumeration
    return res.status(200).json({
      success: true,
      message: "If an account exists with this email, a password reset link has been sent.",
    });
  },

  async verifyResetToken(req: Request, res: Response) {
    const { token } = req.params;
    const resetToken = Array.isArray(token) ? token[0] : token;
    const result = await AuthService.verifyResetToken(resetToken);

    if (!result.valid) {
      return res.status(400).json({
        success: false,
        error: { message: "Invalid or expired reset token", code: "INVALID_TOKEN" },
      });
    }

    return res.status(200).json({ success: true, data: { email: result.email } });
  },

  async resetPassword(req: Request, res: Response) {
    const { token, password } = req.body as { token: string; password: string };
    await AuthService.resetPassword(token, password);
    return res.status(200).json({
      success: true,
      message: "Password reset successful. You can now log in with your new password.",
    });
  },
};

export default AuthController;

