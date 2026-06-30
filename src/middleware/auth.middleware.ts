import { Request, Response, NextFunction } from "express";
import { HUserDocument } from "../DB/models/User.model";
import { UnauthorizedException } from "../utils/response/error.response";
import { decodeToken, TokenEnum } from "../utils/security/token.security";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return next(new UnauthorizedException("Authentication token is missing"));
        }

        const { user } = await decodeToken({ 
            authorization: authHeader, 
            tokenType: TokenEnum.access 
        });

        req.user = user as HUserDocument;
        next();
    } catch (error) {
        return next(error);
    }
};
