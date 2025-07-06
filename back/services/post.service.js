import postModel from "../models/post.model.js";

export const createPost = async (body) => {
    try {
        const newPost = new postModel(body);


        await newPost.save();

        return newPost;
    } catch (error) {
        throw error;
        
    }
};

export const updatePost = async (params, body) => {
    try {
        const updatedPost = await postModel.findById(params.id);
        if (updatedPost.userId === body.userId) {
            await postModel.updateOne(
                { $set: body,}
            );
            return updatedPost;
        } else {
            throw new Error("You can only update your own posts!");
        }

    } catch (error) {
        throw error;
        
    }
};

export const deletePost = async (params, body) => {
    try {
        const deletedPost = await postModel.findById(params.id);
        if (deletedPost.userId === body.userId) {
            await postModel.deleteOne();
            return deletedPost;
        } else {
            throw new Error("You can only delete your own posts!");
        }

    } catch (error) {
        throw error;

    }
};
