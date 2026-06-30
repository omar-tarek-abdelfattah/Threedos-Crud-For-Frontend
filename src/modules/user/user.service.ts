import { Request, Response } from "express";
import { successResponse } from "../../utils/response/success.response";

class UserService {
    getProfile = async (req: Request, res: Response) => {
        const user = req.user?.toObject();
        if (user) {
            delete user.password;
        }

        return successResponse({
            res,
            message: "Profile retrieved successfully",
            statusCode: 200,
            data: { user }
        });
    };
}

export const userService = new UserService();
