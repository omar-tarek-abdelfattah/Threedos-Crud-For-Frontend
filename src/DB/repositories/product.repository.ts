import { Model } from "mongoose";
import { HProductDocument as Tdocument } from "../models/Product.model";
import { DatabaseRepository } from "./database.repository";

export class ProductRepository extends DatabaseRepository<Tdocument> {
    constructor(protected override readonly model: Model<Tdocument>) {
        super(model)
    }

}


