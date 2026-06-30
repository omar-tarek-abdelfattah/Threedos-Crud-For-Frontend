import { Router } from "express";
import { authService } from "./auth.service";
import { validation } from "../../middleware/validation.middleware";
import { registerSchema, loginSchema } from "./auth.validation";

const router = Router();

router.post("/register", validation(registerSchema), authService.register);
router.post("/login", validation(loginSchema), authService.login);

export default router;
