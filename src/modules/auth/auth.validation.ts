import { z } from "zod";
import { generalFields } from "../../middleware/validation.middleware";

export const registerSchema = {
    body: z.object({
        name: z.string().min(3),
        email: generalFields.email,
        password: generalFields.password,
        imageUrl: z.string().url().optional(),
    }),
};

export const loginSchema = {
    body: z.object({
        email: generalFields.email,
        password: z.string().min(1, "Password is required"),
    }),
};
