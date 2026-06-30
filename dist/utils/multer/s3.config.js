"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3Delete = exports.s3Upload = exports.s3Client = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const uuid_1 = require("uuid");
const node_fs_1 = __importDefault(require("node:fs"));
exports.s3Client = new client_s3_1.S3Client({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ""
    }
});
const s3Upload = async ({ fileBuffer, filePath, mimetype, originalname, folderName, filenameOverride }) => {
    const filename = filenameOverride ? filenameOverride : (folderName ? `${folderName}/${(0, uuid_1.v4)()}_${originalname}` : `${(0, uuid_1.v4)()}_${originalname}`);
    let bodyData;
    if (fileBuffer) {
        bodyData = fileBuffer;
    }
    else if (filePath) {
        bodyData = node_fs_1.default.createReadStream(filePath);
    }
    else {
        throw new Error("Must provide either fileBuffer or filePath");
    }
    const command = new client_s3_1.PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME || "",
        Key: filename,
        Body: bodyData,
        ContentType: mimetype,
    });
    await exports.s3Client.send(command);
    return {
        filename,
        url: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`
    };
};
exports.s3Upload = s3Upload;
const s3Delete = async (filename) => {
    const command = new client_s3_1.DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME || "",
        Key: filename
    });
    return await exports.s3Client.send(command);
};
exports.s3Delete = s3Delete;
