import mongoose from "mongoose";
import { Schema } from "mongoose";

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        min: 4,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    profilePicture: {
        type: String,
        default: "",
    },
    coverPicture: {
        type: String,
        default: "",
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    followers: {
        type: [String],
        default: [],
    },
    following: {
        type: [String],
        default: [],
    },
    desc: {
        type: String,
        max: 250,
    },
    from: {
        type: String,
        default: "",
    },
    relationship:{
        type: Number,
        enum: [1, 2, 3], // 1: Single, 2: In a relationship, 3: It's complicated
        default: 1,
    },
    


});

export default mongoose.model("User", userSchema);