"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const User_model_1 = __importDefault(require("../../DB/models/User.model"));
const user_repository_1 = require("../../DB/repositories/user.repository");
const error_response_1 = require("../../utils/response/error.response");
const success_response_1 = require("../../utils/response/success.response");
const token_security_1 = require("../../utils/security/token.security");
class AuthService {
    userModel = new user_repository_1.UserRepository(User_model_1.default);
    register = async (req, res) => {
        const { name, email, password, imageUrl } = req.body;
        const existingUser = await this.userModel.findOne({ filter: { email } });
        if (existingUser) {
            throw new error_response_1.ConflictException("Email is already in use");
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const newUser = await this.userModel.create({
            data: [{
                    name,
                    email,
                    password: hashedPassword,
                    imageUrl: imageUrl,
                }]
        });
        if (!newUser) {
            throw new error_response_1.BadRequestException('something went wrong with creating a new user');
        }
        return (0, success_response_1.successResponse)({
            res,
            message: "User registered successfully",
            statusCode: 201,
            data: { user: newUser[0] }
        });
    };
    login = async (req, res, next) => {
        const { email, password } = req.body;
        const user = await this.userModel.findOne({ filter: { email } });
        if (!user) {
            throw new error_response_1.BadRequestException("Invalid credentials");
        }
        const isMatch = await bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            throw new error_response_1.BadRequestException("Invalid credentials");
        }
        const { access_token, refresh_token } = await (0, token_security_1.createLoginCredentials)(user);
        return (0, success_response_1.successResponse)({
            res,
            message: "Logged in successfully",
            statusCode: 200,
            data: { access_token, refresh_token }
        });
    };
}
exports.authService = new AuthService();
