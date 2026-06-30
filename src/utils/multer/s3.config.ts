import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuid } from "uuid";
import fs from "node:fs";
// import path from "node:path";

export const s3Client = new S3Client({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ""
    }
});

/**
 * Uploads a file to AWS S3.
 *
 * @param {Object} NamedParam - The parameter object.
 * @param {Buffer} [NamedParam.fileBuffer] - The file buffer to upload.
 * @param {string} [NamedParam.filePath] - The local file path to upload from.
 * @param {string} NamedParam.mimetype - The MIME type of the file.
 * @param {string} NamedParam.originalname - The original name of the file.
 * @param {string} [NamedParam.folderName] - The target folder name in S3.
 * @param {string} [NamedParam.filenameOverride] - An optional override for the final filename.
 * @returns {Promise<{filename: string, url: string}>} An object containing the generated filename and S3 URL.
 */
export const s3Upload = async ({ fileBuffer, filePath, mimetype, originalname, folderName, filenameOverride }: { fileBuffer?: Buffer | undefined, filePath?: string | undefined, mimetype: string, originalname: string, folderName?: string | undefined, filenameOverride?: string | undefined }) => {
    const filename = filenameOverride ? filenameOverride : (folderName ? `${folderName}/${uuid()}_${originalname}` : `${uuid()}_${originalname}`);

    let bodyData: Buffer | fs.ReadStream | undefined;

    if (fileBuffer) {
        bodyData = fileBuffer;
    } else if (filePath) {
        bodyData = fs.createReadStream(filePath);
    } else {
        throw new Error("Must provide either fileBuffer or filePath");
    }

    const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME || "",
        Key: filename,
        Body: bodyData,
        ContentType: mimetype,
    });

    await s3Client.send(command);

    return {
        filename,
        url: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`
    };
};

/**
 * Deletes a file from AWS S3.
 *
 * @param {string} filename - The key of the file to delete.
 * @returns {Promise<any>} The response from the S3 delete command.
 */
export const s3Delete = async (filename: string) => {
    const command = new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME || "",
        Key: filename
    });
    return await s3Client.send(command);
};

/**
 * Generates a signed URL for accessing a private file in S3.
 *
 * @param {string} filename - The key of the file.
 * @returns {Promise<string>} The generated signed URL valid for 1 hour.
 */
// export const s3GetSignedUrl = async (filename: string) => {
//     const command = new GetObjectCommand({
//         Bucket: process.env.AWS_S3_BUCKET_NAME || "",
//         Key: filename
//     });
//     return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
// };

// let cachedPrivateKey: string | null = null;
// const getPrivateKey = () => {
//     if (cachedPrivateKey) return cachedPrivateKey;
//     try {
//         cachedPrivateKey = fs.readFileSync(path.resolve(process.cwd(), "ecdsa-private.pem"), "utf-8");
//     } catch (error) {
//         console.error("Failed to read CloudFront private key:", error);
//     }
//     return cachedPrivateKey || "";
// };

/**
 * Generates a signed URL for accessing a file through CloudFront.
 *
 * @param {string} filename - The key of the file.
 * @returns {string} The generated CloudFront signed URL valid for 1 hour.
 */
// export const cloudFrontGetSignedUrl = (filename: string) => {
//     let cloudfrontDomain = process.env.CLOUDFRONT_DOMAIN || "";
    
//     if (cloudfrontDomain && !cloudfrontDomain.startsWith("http")) {
//         cloudfrontDomain = `https://${cloudfrontDomain}`;
//     }
//     const keyPairId = process.env.CLOUDFRONT_KEY_PAIR_ID || "";
//     console.log(keyPairId);
//     if (!keyPairId) {
//         console.warn("WARNING: CLOUDFRONT_KEY_PAIR_ID is missing from environment variables!");
//     }
//     const privateKey = getPrivateKey();
//     if (!privateKey) {
//         console.warn("WARNING: CloudFront private key is missing!");
//     }

//     const domain = cloudfrontDomain.replace(/\/$/, "");
//     const key = filename.replace(/^\//, "");
//     const url = `${domain}/${key}`;

//     return getCloudFrontSignedUrl({
//         url,
//         keyPairId,
//         privateKey,
//         dateLessThan: new Date(Date.now() + 3600 * 1000).toISOString()
//     });
// };
