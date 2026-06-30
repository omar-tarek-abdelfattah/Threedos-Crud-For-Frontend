import EventEmitter from "node:events";
import fs from "node:fs";
import { s3Upload, s3Delete } from "./s3.config";

export const s3Event = new EventEmitter();

export interface IS3UploadEvent {
    fileBuffer?: Buffer | undefined;
    filePath?: string | undefined;
    mimetype: string;
    originalname: string;
    folderName?: string | undefined;
    filenameOverride?: string | undefined;
    onSuccess?: (result: { filename: string, url: string }) => void;
    onError?: (error: any) => void;
}

export interface IS3DeleteEvent {
    filename: string;
    onSuccess?: () => void;
    onError?: (error: any) => void;
}

s3Event.on("upload", async (data: IS3UploadEvent) => {
    try {
        const result = await s3Upload({
            fileBuffer: data.fileBuffer,
            filePath: data.filePath,
            mimetype: data.mimetype,
            originalname: data.originalname,
            folderName: data.folderName,
            filenameOverride: data.filenameOverride
        });
        
        if (data.filePath && fs.existsSync(data.filePath)) {
            fs.unlinkSync(data.filePath);
        }

        if (data.onSuccess) data.onSuccess(result);
    } catch (error) {
        console.error("Failed to upload to S3 via event", error);
        
        if (data.filePath && fs.existsSync(data.filePath)) {
            fs.unlinkSync(data.filePath);
        }

        if (data.onError) data.onError(error);
    }
});

s3Event.on("delete", async (data: IS3DeleteEvent) => {
    try {
        await s3Delete(data.filename);
        if (data.onSuccess) data.onSuccess();
    } catch (error) {
        console.error("Failed to delete from S3 via event", error);
        if (data.onError) data.onError(error);
    }
});
