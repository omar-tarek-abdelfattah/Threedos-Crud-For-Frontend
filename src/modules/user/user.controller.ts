import { Router } from "express";
import { userService } from "./user.service";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware);
router.get("/profile", userService.getProfile);

export default router;
