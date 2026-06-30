import { compare, hash } from 'bcrypt'

/**
 * Generates a bcrypt hash for the provided plain text.
 *
 * @param {string} plainText - The plain text string to hash.
 * @param {number} [salt=Number(process.env.SALT)] - The salt rounds for hashing.
 * @returns {Promise<string>} A promise that resolves to the generated hash.
 */
export const generateHash = async (plainText: string, salt: number = Number(process.env.SALT)): Promise<string> => {
    return await hash(plainText, salt)
}
/**
 * Compares a plain text string against a bcrypt hash to verify if they match.
 *
 * @param {Object} NamedParam - The parameter object.
 * @param {string} NamedParam.plainText - The plain text string to verify.
 * @param {string} NamedParam.hash - The bcrypt hash to compare against.
 * @returns {Promise<boolean>} A promise that resolves to a boolean indicating if the match is valid.
 */
export const compareHash = async ({ plainText, hash }: { plainText: string, hash: string }): Promise<boolean> => {
    return await compare(plainText, hash)
}