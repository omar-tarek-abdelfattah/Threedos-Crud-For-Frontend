import { Request, Response } from "express";
import ProductModel from "../../DB/models/Product.model";
import { ProductRepository } from "../../DB/repositories/product.repository";
import { NotFoundException, ForbiddenException, BadRequestException } from "../../utils/response/error.response";
import { successResponse } from "../../utils/response/success.response";
import type { CreateProductDto, UpdateProductDto, UpdateProductIdDto, ProductIdDto } from "./product.dto";
import { Types } from "mongoose";

class ProductService {
    private productModel = new ProductRepository(ProductModel);

    createProduct = async (req: Request, res: Response) => {
        const { title, description, price, imageUrl } = req.body as CreateProductDto;
        const userId = req.user?._id;
        const finalImageUrl = req.file?.path || imageUrl;

        const product = await this.productModel.create({
            data: [{
                title,
                description,
                price,
                imageUrl: finalImageUrl as string,
                createdBy: userId as Types.ObjectId,
            }]
        });

        if (!product) {
            throw new BadRequestException("something went wrong with creating a new product");
        }

        return successResponse({
            res,
            message: "Product created successfully",
            statusCode: 201,
            data: { product: product[0] }
        });
    };

    getProducts = async (req: Request, res: Response) => {
        const products = await this.productModel.find({
            filter: {},
            options: { populate: [{ path: "createdBy", select: "name email imageUrl" }] }
        });

        return successResponse({
            res,
            message: "Products retrieved successfully",
            statusCode: 200,
            data: { products }
        });
    };

    getProductById = async (req: Request, res: Response) => {
        const { id } = req.params as ProductIdDto;
        const product = await this.productModel.findOne({ filter: { _id: id }, options: { populate: { path: "createdBy", select: "name email imageUrl" } } });

        if (!product) {
            throw new NotFoundException("Product not found");
        }

        return successResponse({
            res,
            message: "Product retrieved successfully",
            statusCode: 200,
            data: { product }
        });
    };

    updateProduct = async (req: Request, res: Response) => {
        const { id } = req.params as UpdateProductIdDto;
        const { title, description, price, imageUrl } = req.body as UpdateProductDto;
        const userId = req.user?._id;
        const finalImageUrl = req.file?.path || imageUrl;

        const product = await this.productModel.findOne({ filter: { _id: id } });

        if (!product) {
            throw new NotFoundException("Product not found");
        }

        if (product.createdBy.toString() !== userId?.toString()) {
            throw new ForbiddenException("You are not authorized to update this product");
        }

        const updatedProduct = await this.productModel.findOneAndUpdate({
            filter: { _id: id },
            update: { title, description, price, imageUrl: finalImageUrl },
            options: { new: true }
        });

        return successResponse({
            res,
            message: "Product updated successfully",
            statusCode: 200,
            data: { product: updatedProduct }
        });
    };

    deleteProduct = async (req: Request, res: Response) => {
        const { id } = req.params as ProductIdDto;
        const userId = req.user?._id;

        const product = await this.productModel.findOne({ filter: { _id: id } });

        if (!product) {
            throw new NotFoundException("Product not found");
        }

        if (product.createdBy.toString() !== userId?.toString()) {
            throw new ForbiddenException("You are not authorized to delete this product");
        }

        await this.productModel.findOneAndDelete({ filter: { _id: id } });

        return successResponse({
            res,
            message: "Product deleted successfully",
            statusCode: 200
        });
    };
}

export const productService = new ProductService();
