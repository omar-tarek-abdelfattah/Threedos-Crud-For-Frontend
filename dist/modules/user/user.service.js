"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const success_response_1 = require("../../utils/response/success.response");
class UserService {
    getProfile = async (req, res) => {
        const user = req.user?.toObject();
        if (user) {
            delete user.password;
        }
        return (0, success_response_1.successResponse)({
            res,
            message: "Profile retrieved successfully",
            statusCode: 200,
            data: { user }
        });
    };
}
exports.userService = new UserService();
