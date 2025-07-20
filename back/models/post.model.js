import mongoose from "mongoose";
import { Schema } from "mongoose";

// Esquema para comentarios
const commentSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    text: {
        type: String,
        required: true,
        maxlength: 500,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const postSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    desc: {
        type: String,
        max: 500,
    },
    img: {
        type: String,
        default: "",
    },
    likes: {
        type: [Schema.Types.ObjectId],
        ref: "User",
        default: [],
    },
    comments: [commentSchema]
}, { timestamps: true });

export default mongoose.model("Post", postSchema);