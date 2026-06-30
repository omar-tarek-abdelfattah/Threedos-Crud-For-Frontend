import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { HUserDocument } from "../DB/models/User.model";
import { UnauthorizedException } from "../utils/response/error.response";
import { UserRepository } from "../DB/repositories/user.repository";

const JWT_SECRET = process.env.JWT_SECRET || "default_random_secret_12345";
const userModel = new UserRepository(User)

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return next(new UnauthorizedException("Authentication token is missing or invalid"));
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            return next(new UnauthorizedException("Authentication token is missing"));
        }

        const decoded = jwt.verify(token, JWT_SECRET) as any;
        const user = await userModel.findById({ id: decoded._id })

        if (!user) {
            return next(new UnauthorizedException("User not found"));
        }

        req.user = user as HUserDocument;
        next();
    } catch (error) {
        return next(new UnauthorizedException("Invalid or expired token"));
    }
};
