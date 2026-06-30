"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productIdSchema = exports.updateProductSchema = exports.createProductSchema = void 0;
const zod_1 = require("zod");
const validation_middleware_1 = require("../../middleware/validation.middleware");
exports.createProductSchema = {
    body: zod_1.z.object({
        title: zod_1.z.string().min(1, "Title is required"),
        description: zod_1.z.string().min(1, "Description is required"),
        price: zod_1.z.coerce.number().min(0, "Price must be a positive number"),
    }),
};
exports.updateProductSchema = {
    body: zod_1.z.object({
        title: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
        price: zod_1.z.coerce.number().min(0).optional(),
    }),
    params: zod_1.z.object({
        id: validation_middleware_1.generalFields.id,
    }),
};
exports.productIdSchema = {
    params: zod_1.z.object({
        id: validation_middleware_1.generalFields.id,
    }),
};
