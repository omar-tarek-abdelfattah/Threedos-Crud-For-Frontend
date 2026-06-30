import path from "node:path";
import fs from "node:fs";
import multer, { FileFilterCallback } from "multer";
import { v4 as uuid } from "uuid";
import { Request } from "express";
import { BadRequestException } from "../response/error.response";

export enum StorageEnum {
    memory = "memory",
    disk = "disk"
}

export const fileValidation = {
    image: ["image/jpeg", "image/png", "image/webp"]
}

/**
 * Configures and returns a multer instance for file uploads.
 * Supports both memory and disk storage.
 *
 * @param {Object} NamedParam - The parameter object.
 * @param {string[]} [NamedParam.validation=[]] - Array of allowed mime types.
 * @param {StorageEnum} [NamedParam.storageType=StorageEnum.disk] - The type of storage (memory or disk).
 * @param {number} [NamedParam.maxSizeMb=2] - The maximum file size allowed in megabytes.
 * @param {string} [NamedParam.folderName] - The target folder name for disk storage.
 * @returns {multer.Multer} The configured multer instance.
 */
export const cloudFileUpload = ({
    validation = [],
    storageType = StorageEnum.disk,
    maxSizeMb = 2,
    folderName
}: {
    validation?: string[],
    storageType?: StorageEnum,
    maxSizeMb?: number,
    folderName?: string
}) => {
    const storage = storageType === StorageEnum.memory ? multer.memoryStorage() : multer.diskStorage({
        destination: function (req: any, file, callback) {
            const targetFolder = folderName || (req.user?._id ? `users/${req.user._id.toString()}` : "public");
            const fullPath = path.resolve('uploads', targetFolder);
            
            if (!fs.existsSync(fullPath)) {
                fs.mkdirSync(fullPath, { recursive: true });
            }
            callback(null, fullPath);
        },
        filename: function (req: Request, file: Express.Multer.File, callback) {
            callback(null, `${uuid()}_${file.originalname}`);
        }
    });

    function fileFilter(req: Request, file: Express.Multer.File, callback: FileFilterCallback) {
        if (!validation.includes(file.mimetype)) {
            return callback(new BadRequestException(`validation error`, {
                validationErrors: [{ key: `file`, issues: [{ path: 'file', message: `invalid file format` }] }]
            }) as any);
        }
        return callback(null, true);
    }

    return multer({
        fileFilter,
        limits: {
            fileSize: maxSizeMb * 1024 * 1024
        },
        storage: storage
    });
};
