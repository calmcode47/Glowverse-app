import { Request, Response, NextFunction } from "express";
import { validationResult, ValidationChain } from "express-validator";
import { AppError } from "@utils/errors";

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    void res;
    await Promise.all(validations.map((validation) => validation.run(req)));
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    const extractedErrors: any = {};
    errors.array().forEach((err: any) => {
      if (err.path) {
        extractedErrors[err.path] = err.msg;
      }
    });
    return next(new AppError("Validation failed", 400, extractedErrors));
  };
};

export default validate;
