import { createPost, deletePost, updatePost} from "../services/post.service.js";

export const createPostController = async (req, res) => {
    try {
        const newPost = await createPost(req.body);
        res.status(200).json({
            newPost,
            message: "Post created successfully",
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Post creation failed",
            error,
        });
    }
};

export const updatePostController = async (req, res) => {
    try {
        const updatedPost = await updatePost(req.params, req.body);
        res.status(200).json({
            updatedPost,
            message: "Post updated successfully",
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Post update failed",
            error,
        });
    }
};

export const deletePostController = async (req, res) => {
    try {
        const deletedPost = await deletePost(req.params, req.body);
        res.status(200).json({
            deletedPost,
            message: "Post deleted successfully",
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Post deletion failed",
            error,
        });
    }
};
