import { z } from "zod";
import { registerSchema, loginSchema } from "./auth.validation";

export type RegisterDto = z.infer<typeof registerSchema.body>;
export type LoginDto = z.infer<typeof loginSchema.body>;
