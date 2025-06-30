import postModel from "../models/post.model.js";

export const createPost = async (body) => {
    try {
        const newPost = new postModel(body);


        await newPost.save();

        return newPost;
    } catch (error) {
        throw error;
        
    }
}