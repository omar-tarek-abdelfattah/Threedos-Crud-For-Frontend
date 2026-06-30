import mongoose, { Schema, Document } from "mongoose";

export interface HProductDocument extends Document {
    title: string;
    description: string;
    price: number;
    imageUrl?: string;
    createdBy: mongoose.Types.ObjectId;
}

const productSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    price: {
        type: Number,
        required: true,
    },
    imageUrl: {
        type: String,
        default: "",
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model<HProductDocument>("Product", productSchema);
export default Product;
