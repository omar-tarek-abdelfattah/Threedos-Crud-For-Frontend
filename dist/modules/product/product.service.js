"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productService = void 0;
const Product_model_1 = __importDefault(require("../../DB/models/Product.model"));
const product_repository_1 = require("../../DB/repositories/product.repository");
const error_response_1 = require("../../utils/response/error.response");
const success_response_1 = require("../../utils/response/success.response");
class ProductService {
    productModel = new product_repository_1.ProductRepository(Product_model_1.default);
    createProduct = async (req, res) => {
        const { title, description, price, imageUrl } = req.body;
        const userId = req.user?._id;
        const finalImageUrl = req.file?.path || imageUrl;
        const product = await this.productModel.create({
            data: [{
                    title,
                    description,
                    price,
                    imageUrl: finalImageUrl,
                    createdBy: userId,
                }]
        });
        if (!product) {
            throw new error_response_1.BadRequestException("something went wrong with creating a new product");
        }
        return (0, success_response_1.successResponse)({
            res,
            message: "Product created successfully",
            statusCode: 201,
            data: { product: product[0] }
        });
    };
    getProducts = async (req, res) => {
        const products = await this.productModel.find({
            filter: {},
            options: { populate: [{ path: "createdBy", select: "name email imageUrl" }] }
        });
        return (0, success_response_1.successResponse)({
            res,
            message: "Products retrieved successfully",
            statusCode: 200,
            data: { products }
        });
    };
    getProductById = async (req, res) => {
        const { id } = req.params;
        const product = await this.productModel.findOne({ filter: { _id: id }, options: { populate: { path: "createdBy", select: "name email imageUrl" } } });
        if (!product) {
            throw new error_response_1.NotFoundException("Product not found");
        }
        return (0, success_response_1.successResponse)({
            res,
            message: "Product retrieved successfully",
            statusCode: 200,
            data: { product }
        });
    };
    updateProduct = async (req, res) => {
        const { id } = req.params;
        const { title, description, price, imageUrl } = req.body;
        const userId = req.user?._id;
        const finalImageUrl = req.file?.path || imageUrl;
        const product = await this.productModel.findOne({ filter: { _id: id } });
        if (!product) {
            throw new error_response_1.NotFoundException("Product not found");
        }
        if (product.createdBy.toString() !== userId?.toString()) {
            throw new error_response_1.ForbiddenException("You are not authorized to update this product");
        }
        const updatedProduct = await this.productModel.findOneAndUpdate({
            filter: { _id: id },
            update: { title, description, price, imageUrl: finalImageUrl },
            options: { new: true }
        });
        return (0, success_response_1.successResponse)({
            res,
            message: "Product updated successfully",
            statusCode: 200,
            data: { product: updatedProduct }
        });
    };
    deleteProduct = async (req, res) => {
        const { id } = req.params;
        const userId = req.user?._id;
        const product = await this.productModel.findOne({ filter: { _id: id } });
        if (!product) {
            throw new error_response_1.NotFoundException("Product not found");
        }
        if (product.createdBy.toString() !== userId?.toString()) {
            throw new error_response_1.ForbiddenException("You are not authorized to delete this product");
        }
        await this.productModel.findOneAndDelete({ filter: { _id: id } });
        return (0, success_response_1.successResponse)({
            res,
            message: "Product deleted successfully",
            statusCode: 200
        });
    };
}
exports.productService = new ProductService();
