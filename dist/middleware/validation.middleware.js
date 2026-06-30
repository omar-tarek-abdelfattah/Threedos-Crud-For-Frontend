"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validation = exports.generalFields = void 0;
const zod_1 = require("zod");
const error_response_1 = require("../utils/response/error.response");
const mongoose_1 = require("mongoose");
exports.generalFields = {
    username: zod_1.z.string().min(3).max(25),
    firstName: zod_1.z.string().min(3, "First name must be at least 3 characters long"),
    lastName: zod_1.z.string().min(3, "Last name must be at least 3 characters long"),
    email: zod_1.z.string().email("Invalid email address"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters long").regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/, "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"),
    confirmPassword: zod_1.z.string(),
    otp: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).transform(val => val.toString()),
    file: function (mimetype) {
        return zod_1.z.strictObject({
            fieldname: zod_1.z.string(),
            originalname: zod_1.z.string(),
            encoding: zod_1.z.string(),
            mimetype: zod_1.z.enum(mimetype),
            buffer: zod_1.z.any().optional(),
            path: zod_1.z.string().optional(),
            size: zod_1.z.number()
        }).refine((data) => {
            return data.buffer || data.path;
        }, { error: "neither path or buffer is provided", path: ["file"] });
    }, id: zod_1.z.string().refine(data => { return mongoose_1.Types.ObjectId.isValid(data); }, { error: "invalid object id format " }),
    page: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).transform(val => Number(val)).optional(),
    size: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).transform(val => Number(val)).optional(),
    sortBy: zod_1.z.enum(["asc", "desc"]),
    rating: zod_1.z.enum(["asc", "desc"]),
    timing: zod_1.z.enum(["latest", "early"]),
    popularity: zod_1.z.enum(["most", "least"]),
};
const validation = (schema) => {
    return (req, res, next) => {
        const validationErrors = [];
        for (const key of Object.keys(schema)) {
            if (!schema[key])
                continue;
            const validationResult = schema[key].safeParse(req[key]);
            if (!validationResult.success) {
                const errors = validationResult.error;
                validationErrors.push({ key, issues: errors.issues.map(issue => { return { message: issue.message, path: issue.path }; }) });
            }
            else {
                Object.defineProperty(req, key, {
                    value: validationResult.data,
                    writable: true,
                    configurable: true,
                    enumerable: true
                });
            }
        }
        ;
        if (validationErrors.length) {
            throw new error_response_1.BadRequestException("validation Error", { validationErrors });
        }
        ;
        return next();
    };
};
exports.validation = validation;
