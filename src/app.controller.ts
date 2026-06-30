import type { Express, Response, Request } from "express";
import express from "express";
import { resolve } from "node:path"
import { config } from "dotenv"
config({ path: resolve("./src/config/.env.development"), quiet: true })
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import connectDB from "./DB/db.connection";
import { globalErrorHandling } from "./utils/response/error.response";




const bootstrap = () => {
    const app: Express = express();
    const port: number = 3000;

    app.use(cors());
    app.use(helmet());
    app.use(morgan("dev"));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));



    connectDB();

    app.use("/auth", require("./modules/auth/auth.controller").default);
    app.use("/users", require("./modules/user/user.controller").default);
    app.use("/products", require("./modules/product/product.controller").default);

    app.use(globalErrorHandling)

    app.get('/', (req: Request, res: Response) => {
        res.send({ message: "hello world" })
    })

    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    })
}

export default bootstrap