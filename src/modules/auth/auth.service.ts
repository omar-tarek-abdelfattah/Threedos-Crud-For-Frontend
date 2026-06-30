import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import UserModel from "../../DB/models/User.model";
import { UserRepository } from "../../DB/repositories/user.repository";
import { ConflictException, BadRequestException } from "../../utils/response/error.response";
import { successResponse } from "../../utils/response/success.response";
import { RegisterDto, LoginDto } from "./auth.dto";
import { createLoginCredentials } from "../../utils/security/token.security";

class AuthService {
    private userModel = new UserRepository(UserModel);

    register = async (req: Request, res: Response) => {

        const { name, email, password, imageUrl } = req.body as RegisterDto;

        const existingUser = await this.userModel.findOne({ filter: { email } });
        if (existingUser) {
            throw new ConflictException("Email is already in use");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await this.userModel.create({
            data: [{
                name,
                email,
                password: hashedPassword,
                imageUrl: imageUrl as string,
            }]
        });

        if (!newUser) {
            throw new BadRequestException('something went wrong with creating a new user')
        }


        return successResponse({
            res,
            message: "User registered successfully",
            statusCode: 201,
            data: { user: newUser[0] }
        });

    };

    login = async (req: Request, res: Response, next: NextFunction) => {

        const { email, password } = req.body as LoginDto;

        const user = await this.userModel.findOne({ filter: { email } });
        if (!user) {
            throw new BadRequestException("Invalid credentials");
        }

        const isMatch = await bcrypt.compare(password, user.password as string);
        if (!isMatch) {
            throw new BadRequestException("Invalid credentials");
        }

        const { access_token, refresh_token } = await createLoginCredentials(user as any);

        return successResponse({
            res,
            message: "Logged in successfully",
            statusCode: 200,
            data: { access_token, refresh_token }
        });

    };
}

export const authService = new AuthService();
