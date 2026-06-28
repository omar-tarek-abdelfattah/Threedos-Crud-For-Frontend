"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const node_path_1 = require("node:path");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)({ path: (0, node_path_1.resolve)("./src/config/.env.development"), quiet: true });
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const db_connection_1 = __importDefault(require("./DB/db.connection"));
const error_response_1 = require("./utils/response/error.response");
const bootstrap = () => {
    const app = (0, express_1.default)();
    const port = 3000;
    app.use((0, cors_1.default)());
    app.use((0, helmet_1.default)());
    app.use((0, morgan_1.default)("dev"));
    app.use(express_1.default.json());
    app.use(express_1.default.urlencoded({ extended: true }));
    (0, db_connection_1.default)();
    app.use(error_response_1.globalErrorHandling);
    app.get('/', (req, res) => {
        res.send({ message: "hello world" });
    });
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
};
exports.default = bootstrap;
