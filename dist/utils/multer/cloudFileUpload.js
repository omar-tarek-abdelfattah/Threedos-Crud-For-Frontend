"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudFileUpload = exports.fileValidation = exports.StorageEnum = void 0;
const node_path_1 = __importDefault(require("node:path"));
const node_fs_1 = __importDefault(require("node:fs"));
const multer_1 = __importDefault(require("multer"));
const uuid_1 = require("uuid");
const error_response_1 = require("../response/error.response");
var StorageEnum;
(function (StorageEnum) {
    StorageEnum["memory"] = "memory";
    StorageEnum["disk"] = "disk";
})(StorageEnum || (exports.StorageEnum = StorageEnum = {}));
exports.fileValidation = {
    image: ["image/jpeg", "image/png", "image/webp"]
};
const cloudFileUpload = ({ validation = [], storageType = StorageEnum.disk, maxSizeMb = 2, folderName }) => {
    const storage = storageType === StorageEnum.memory ? multer_1.default.memoryStorage() : multer_1.default.diskStorage({
        destination: function (req, file, callback) {
            const targetFolder = folderName || (req.user?._id ? `users/${req.user._id.toString()}` : "public");
            const fullPath = node_path_1.default.resolve('uploads', targetFolder);
            if (!node_fs_1.default.existsSync(fullPath)) {
                node_fs_1.default.mkdirSync(fullPath, { recursive: true });
            }
            callback(null, fullPath);
        },
        filename: function (req, file, callback) {
            callback(null, `${(0, uuid_1.v4)()}_${file.originalname}`);
        }
    });
    function fileFilter(req, file, callback) {
        if (!validation.includes(file.mimetype)) {
            return callback(new error_response_1.BadRequestException(`validation error`, {
                validationErrors: [{ key: `file`, issues: [{ path: 'file', message: `invalid file format` }] }]
            }));
        }
        return callback(null, true);
    }
    return (0, multer_1.default)({
        fileFilter,
        limits: {
            fileSize: maxSizeMb * 1024 * 1024
        },
        storage: storage
    });
};
exports.cloudFileUpload = cloudFileUpload;
