import { z } from "zod";
import { generalFields } from "../../middleware/validation.middleware";

export const createProductSchema = {
    body: z.object({
        title: z.string().min(1, "Title is required"),
        description: z.string().min(1, "Description is required"),
        price: z.number().min(0, "Price must be a positive number"),
        imageUrl: z.string().optional(),
    }),
};

export const updateProductSchema = {
    body: z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        price: z.number().min(0).optional(),
        imageUrl: z.string().optional(),
    }),
    params: z.object({
        id: generalFields.id,
    }),
};

export const productIdSchema = {
    params: z.object({
        id: generalFields.id,
    }),
};
