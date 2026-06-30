import type { NextFunction, Request, Response } from "express"
import { z, type ZodError, type ZodType } from "zod"
import { BadRequestException } from "../utils/response/error.response"
import { Types } from "mongoose"

export const generalFields = {
    username: z.string().min(3).max(25),
    firstName: z.string().min(3, "First name must be at least 3 characters long"),
    lastName: z.string().min(3, "Last name must be at least 3 characters long"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long").regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/, "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"),
    confirmPassword: z.string(),
    otp: z.union([z.string(), z.number()]).transform(val => val.toString()),
    file: function (mimetype: string[]) {
        return z.strictObject({
            fieldname: z.string(),
            originalname: z.string(),
            encoding: z.string(),
            mimetype: z.enum(mimetype),
            buffer: z.any().optional(),
            path: z.string().optional(),
            size: z.number()
        }).refine((data) => {
            return data.buffer || data.path
        }, { error: "neither path or buffer is provided", path: ["file"] })
    }, id: z.string().refine(data => { return Types.ObjectId.isValid(data) }, { error: "invalid object id format " }),
    page: z.union([z.string(), z.number()]).transform(val => Number(val)).optional(),
    size: z.union([z.string(), z.number()]).transform(val => Number(val)).optional(),
    sortBy: z.enum(["asc", "desc"]),
    rating: z.enum(["asc", "desc"]),
    timing: z.enum(["latest", "early"]),
    popularity: z.enum(["most", "least"]),
}


type KeyReqType = keyof Request
type SchemaType = Partial<Record<KeyReqType, ZodType>>

type validationErrors = Array<{
    key: KeyReqType,
    issues: Array<{
        message: string,
        path: (string | number | symbol | undefined)[]
    }>
}>

export const validation = (schema: SchemaType) => {


    return (req: Request, res: Response, next: NextFunction): NextFunction => {

        const validationErrors: validationErrors = []

        for (const key of Object.keys(schema) as KeyReqType[]) {
            if (!schema[key]) continue;




            const validationResult = schema[key].safeParse(req[key])

            if (!validationResult.success) {
                const errors = validationResult.error as ZodError
                validationErrors.push({ key, issues: errors.issues.map(issue => { return { message: issue.message, path: issue.path } }) })
            } else {
                Object.defineProperty(req, key, {
                    value: validationResult.data,
                    writable: true,
                    configurable: true,
                    enumerable: true
                });
            }
        };

        if (validationErrors.length) {
            throw new BadRequestException("validation Error", { validationErrors });
        };


        return next() as unknown as NextFunction
    }
}