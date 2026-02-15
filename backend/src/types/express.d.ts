export type UserRole = 'USER' | 'ADMIN' | 'VENDOR';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role?: UserRole | string;
      };
      file?: Express.Multer.File;
      files?: Express.Multer.File[];
    }
  }
}

export { };
