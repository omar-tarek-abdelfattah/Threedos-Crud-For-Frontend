"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const error_response_1 = require("../utils/response/error.response");
const token_security_1 = require("../utils/security/token.security");
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return next(new error_response_1.UnauthorizedException("Authentication token is missing"));
        }
        const { user } = await (0, token_security_1.decodeToken)({
            authorization: authHeader,
            tokenType: token_security_1.TokenEnum.access
        });
        req.user = user;
        next();
    }
    catch (error) {
        return next(error);
    }
};
exports.authMiddleware = authMiddleware;
