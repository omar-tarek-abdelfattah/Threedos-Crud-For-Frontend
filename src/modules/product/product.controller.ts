import { Router } from "express";
import { productService } from "./product.service";
import { authMiddleware } from "../../middleware/auth.middleware";
import { validation } from "../../middleware/validation.middleware";
import { createProductSchema, updateProductSchema, productIdSchema } from "./product.validation";
import { cloudFileUpload, fileValidation } from "../../utils/multer/cloudFileUpload";

const router = Router();

// Public routes
router.get("/", productService.getProducts);
router.get("/:id", validation(productIdSchema), productService.getProductById);

// Protected routes
router.use(authMiddleware);
router.post("/", cloudFileUpload({ validation: fileValidation.image, folderName: "products" }).single("image"), validation(createProductSchema), productService.createProduct);
router.patch("/:id", cloudFileUpload({ validation: fileValidation.image, folderName: "products" }).single("image"), validation(updateProductSchema), productService.updateProduct);
router.delete("/:id", validation(productIdSchema), productService.deleteProduct);

export default router;
