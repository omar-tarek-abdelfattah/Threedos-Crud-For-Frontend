import { Response } from "express";

/**
 * Constructs and sends a standardized success response.
 *
 * @param {Object} NamedParam - The parameter object.
 * @param {Response} NamedParam.res - The Express response object.
 * @param {string} [NamedParam.message="Done"] - The success message.
 * @param {number} [NamedParam.statusCode=200] - The HTTP status code.
 * @param {T} [NamedParam.data] - The response data.
 * @param {any} [NamedParam.meta] - Additional metadata for the response.
 * @returns {Response} The Express response object.
 */
export const successResponse = <T = any>({
    res,
    message = "Done",
    statusCode = 200,
    data,
    meta
}: {
        res: Response,
        message?: string,
        statusCode?: number,
        data?: T,
        meta?: any
    }) :Response=> {
    return res.status(statusCode).json({ message, statusCode, data, ...meta })
}