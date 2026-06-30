"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
const validation_middleware_1 = require("../../middleware/validation.middleware");
exports.registerSchema = {
    body: zod_1.z.object({
        name: zod_1.z.string().min(3),
        email: validation_middleware_1.generalFields.email,
        password: validation_middleware_1.generalFields.password,
        imageUrl: zod_1.z.string().url().optional(),
    }),
};
exports.loginSchema = {
    body: zod_1.z.object({
        email: validation_middleware_1.generalFields.email,
        password: zod_1.z.string().min(1, "Password is required"),
    }),
};
