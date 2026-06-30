import mongoose, { Schema, Document } from "mongoose";

export interface HUserDocument extends Document {
    name: string;
    email: string;
    password?: string;
    imageUrl?: string;
}

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String,
        default: "",
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

const User = mongoose.models.User || mongoose.model<HUserDocument>("User", userSchema);
export default User;
