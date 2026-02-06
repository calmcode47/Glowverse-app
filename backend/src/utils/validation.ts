import { body } from "express-validator";

export const emailPasswordRules = [body("email").isEmail(), body("password").isString()];
