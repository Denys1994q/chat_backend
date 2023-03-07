import { body } from "express-validator";

export const registerValidation = [
    body("email", "Invalid email").isEmail(),
    body("password", "At least 10 chars long").isLength({ min: 10 }),
    body("password", "Must contain a digit").matches(/\d/),
    body("fullName", "At least 3 chars long").isLength({ min: 3 }),
    body("avatarUrl", "Invalid url").optional().isString(),
];

export const loginValidation = [
    body("email", "Invalid email").isEmail(),
    body("password", "At least 10 chars long").isLength({ min: 10 }),
];
