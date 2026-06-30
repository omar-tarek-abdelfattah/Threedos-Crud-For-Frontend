"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeToken = exports.createLoginCredentials = exports.verifyToken = exports.generateToken = exports.logoutEnum = exports.TokenEnum = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const uuid_1 = require("uuid");
const error_response_1 = require("../response/error.response");
const user_repository_1 = require("../../DB/repositories/user.repository");
const User_model_1 = __importDefault(require("../../DB/models/User.model"));
var TokenEnum;
(function (TokenEnum) {
    TokenEnum["access"] = "access";
    TokenEnum["refresh"] = "refresh";
})(TokenEnum || (exports.TokenEnum = TokenEnum = {}));
var logoutEnum;
(function (logoutEnum) {
    logoutEnum["all"] = "all";
    logoutEnum["only"] = "only";
})(logoutEnum || (exports.logoutEnum = logoutEnum = {}));
const generateToken = async ({ payload, secret = process.env.ACCESS_USER_TOKEN_SIGNATURE, options = { expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES_IN) }, }) => {
    return (0, jsonwebtoken_1.sign)(payload, secret, options);
};
exports.generateToken = generateToken;
const verifyToken = async ({ token, secret = process.env.ACCESS_USER_TOKEN_SIGNATURE }) => {
    return (0, jsonwebtoken_1.verify)(token, secret);
};
exports.verifyToken = verifyToken;
const createLoginCredentials = async (user) => {
    const jwtid = (0, uuid_1.v4)();
    const access_token = await (0, exports.generateToken)({
        payload: { _id: user._id },
        secret: process.env.ACCESS_USER_TOKEN_SIGNATURE,
        options: { expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES_IN) || 3600, jwtid }
    });
    const refresh_token = await (0, exports.generateToken)({
        payload: { _id: user._id },
        secret: process.env.REFRESH_USER_TOKEN_SIGNATURE,
        options: { expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRES_IN) || 86400, jwtid }
    });
    return { access_token, refresh_token };
};
exports.createLoginCredentials = createLoginCredentials;
const decodeToken = async ({ authorization, tokenType }) => {
    const userModel = new user_repository_1.UserRepository(User_model_1.default);
    const [bearerKey, token] = authorization.split(" ");
    if (!bearerKey || !token) {
        throw new error_response_1.UnauthorizedException(`missing token parts`);
    }
    if (bearerKey !== "Bearer") {
        throw new error_response_1.UnauthorizedException(`Invalid bearer key`);
    }
    let decoded;
    try {
        decoded = await (0, exports.verifyToken)({
            token, secret: tokenType === TokenEnum.refresh ? process.env.REFRESH_USER_TOKEN_SIGNATURE : process.env.ACCESS_USER_TOKEN_SIGNATURE
        });
    }
    catch (error) {
        throw new error_response_1.BadRequestException(`invalid token or signature`);
    }
    if (!decoded?._id || !decoded?.iat) {
        throw new error_response_1.BadRequestException(`invalid token payload`);
    }
    const user = await userModel.findOne({
        filter: {
            _id: decoded._id
        }
    });
    if (!user) {
        throw new error_response_1.BadRequestException('Not Registered account');
    }
    return { user, decoded };
};
exports.decodeToken = decodeToken;
