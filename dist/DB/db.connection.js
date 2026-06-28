"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const connectDB = async () => {
    const atlasConnection = process.env.MONGO_URI;
    try {
        await (0, mongoose_1.connect)(`${atlasConnection}/${process.env.MONGO_DATABASE}`);
        console.log("Database connected");
    }
    catch (error) {
        console.log(error);
    }
};
exports.default = connectDB;
