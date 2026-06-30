"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3Event = void 0;
const node_events_1 = __importDefault(require("node:events"));
const node_fs_1 = __importDefault(require("node:fs"));
const s3_config_1 = require("./s3.config");
exports.s3Event = new node_events_1.default();
exports.s3Event.on("upload", async (data) => {
    try {
        const result = await (0, s3_config_1.s3Upload)({
            fileBuffer: data.fileBuffer,
            filePath: data.filePath,
            mimetype: data.mimetype,
            originalname: data.originalname,
            folderName: data.folderName,
            filenameOverride: data.filenameOverride
        });
        if (data.filePath && node_fs_1.default.existsSync(data.filePath)) {
            node_fs_1.default.unlinkSync(data.filePath);
        }
        if (data.onSuccess)
            data.onSuccess(result);
    }
    catch (error) {
        console.error("Failed to upload to S3 via event", error);
        if (data.filePath && node_fs_1.default.existsSync(data.filePath)) {
            node_fs_1.default.unlinkSync(data.filePath);
        }
        if (data.onError)
            data.onError(error);
    }
});
exports.s3Event.on("delete", async (data) => {
    try {
        await (0, s3_config_1.s3Delete)(data.filename);
        if (data.onSuccess)
            data.onSuccess();
    }
    catch (error) {
        console.error("Failed to delete from S3 via event", error);
        if (data.onError)
            data.onError(error);
    }
});
