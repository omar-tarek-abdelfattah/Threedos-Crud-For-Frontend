import { z } from "zod";
import { createProductSchema, updateProductSchema, productIdSchema } from "./product.validation";

export type CreateProductDto = z.infer<typeof createProductSchema.body>;
export type UpdateProductDto = z.infer<typeof updateProductSchema.body>;
export type UpdateProductIdDto = z.infer<typeof updateProductSchema.params>;
export type ProductIdDto = z.infer<typeof productIdSchema.params>;
