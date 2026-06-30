"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_model_1 = __importDefault(require("../DB/models/User.model"));
const error_response_1 = require("../utils/response/error.response");
const user_repository_1 = require("../DB/repositories/user.repository");
const JWT_SECRET = process.env.JWT_SECRET || "default_random_secret_12345";
const userModel = new user_repository_1.UserRepository(User_model_1.default);
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return next(new error_response_1.UnauthorizedException("Authentication token is missing or invalid"));
        }
        const token = authHeader.split(" ")[1];
        if (!token) {
            return next(new error_response_1.UnauthorizedException("Authentication token is missing"));
        }
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const user = await userModel.findById({ id: decoded._id });
        if (!user) {
            return next(new error_response_1.UnauthorizedException("User not found"));
        }
        req.user = user;
        next();
    }
    catch (error) {
        return next(new error_response_1.UnauthorizedException("Invalid or expired token"));
    }
};
exports.authMiddleware = authMiddleware;
