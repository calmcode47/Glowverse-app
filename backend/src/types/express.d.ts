import { UserRole } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role?: UserRole;
      };
      file?: Express.Multer.File;
      files?: Express.Multer.File[];
    }
  }
}

export {};
