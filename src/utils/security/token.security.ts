import { JwtPayload, sign, type SignOptions, verify } from "jsonwebtoken";
import { HUserDocument } from "../../DB/models/User.model";
import { v4 as uuid } from "uuid"
import { BadRequestException, UnauthorizedException } from "../response/error.response";
import { UserRepository } from "../../DB/repositories/user.repository";


import UserModel from "../../DB/models/User.model";

export enum TokenEnum {
    access = `access`,
    refresh = "refresh"
}
export enum logoutEnum {
    all = `all`,
    only = "only"
}

/**
 * Generates a JSON Web Token (JWT).
 *
 * @param {Object} NamedParam - The parameter object.
 * @param {object} NamedParam.payload - The payload to encode in the token.
 * @param {string} [NamedParam.secret=process.env.ACCESS_USER_TOKEN_SIGNATURE] - The secret signature used to sign the token.
 * @param {SignOptions} [NamedParam.options={expiresIn: ...}] - Additional JWT sign options.
 * @returns {Promise<string>} A promise that resolves to the generated JWT string.
 */
export const generateToken = async ({
    payload,
    secret = process.env.ACCESS_USER_TOKEN_SIGNATURE as string,
    options = { expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES_IN) },

}: {
    payload: object,
    secret?: string,
    options?: SignOptions
}): Promise<string> => {
    return sign(payload, secret, options)
}

/**
 * Verifies a JSON Web Token (JWT).
 *
 * @param {Object} NamedParam - The parameter object.
 * @param {string} NamedParam.token - The token to verify.
 * @param {string} [NamedParam.secret=process.env.ACCESS_USER_TOKEN_SIGNATURE] - The secret signature used for verification.
 * @returns {Promise<JwtPayload>} A promise that resolves to the decoded token payload.
 */
export const verifyToken = async ({ token,
    secret = process.env.ACCESS_USER_TOKEN_SIGNATURE as string }:
    { token: string, secret?: string }): Promise<JwtPayload> => {
    return verify(token, secret) as JwtPayload
}




/**
 * Creates login credentials (access and refresh tokens) for a user.
 *
 * @param {HUserDocument} user - The user document to create credentials for.
 * @returns {Promise<{access_token: string, refresh_token: string}>} A promise that resolves to the access and refresh tokens.
 */
export const createLoginCredentials = async (user: HUserDocument) => {
    const jwtid = uuid()

    const access_token = await generateToken({
        payload: { _id: user._id },
        secret: process.env.ACCESS_USER_TOKEN_SIGNATURE as string,
        options: { expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES_IN) || 3600, jwtid }
    })
    const refresh_token = await generateToken({
        payload: { _id: user._id },
        secret: process.env.REFRESH_USER_TOKEN_SIGNATURE as string,
        options: { expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRES_IN) || 86400, jwtid }
    })
    return { access_token, refresh_token }
}

/**
 * Decodes and verifies a JWT token from an authorization header.
 *
 * @param {Object} NamedParam - The parameter object.
 * @param {string} NamedParam.authorization - The authorization header string.
 * @param {TokenEnum} [NamedParam.tokenType] - The type of token expected (access or refresh).
 * @returns {Promise<{user: HUserDocument, decoded: any}>} A promise that resolves to the user document and decoded payload.
 * @throws {UnauthorizedException} If the token is missing, expired, or invalid.
 * @throws {BadRequestException} If the token payload or signature is invalid.
 */
export const decodeToken = async ({ authorization, tokenType }: { authorization: string, tokenType?: TokenEnum }) => {
    const userModel = new UserRepository(UserModel)
    // const tokenModel = new TokenRepository(TokenModel)
    const [bearerKey, token] = authorization.split(" ")
    if (!bearerKey || !token) {
        throw new UnauthorizedException(`missing token parts`)
    }

    if (bearerKey !== "Bearer") {
        throw new UnauthorizedException(`Invalid bearer key`)
    }
    
    let decoded: any;
    try {
        decoded = await verifyToken({
            token, secret: tokenType === TokenEnum.refresh ? process.env.REFRESH_USER_TOKEN_SIGNATURE as string : process.env.ACCESS_USER_TOKEN_SIGNATURE as string
        })
    } catch (error) {
        throw new BadRequestException(`invalid token or signature`)
    }

    if (!decoded?._id || !decoded?.iat) {
        throw new BadRequestException(`invalid token payload`)
    }

    // if (await tokenModel.findOne({ filter: { jti: decoded.jti } })) {
    //     throw new UnauthorizedException(`invalid or expired token`)
    // }

    const user = await userModel.findOne({
        filter: {
            _id: decoded._id
        }
    })

    if (!user) {
        throw new BadRequestException('Not Registered account')
    }

    // if ((user.changeCredentialsTime?.getTime() || 0) > decoded.iat * 1000) {
    //     throw new UnauthorizedException(`invalid or expired token`)
    // }

    return { user, decoded }
}

