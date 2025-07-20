import { createPost, deletePost, updatePost, likeAndUnlikePost, getPost, getTimelinePosts, commentPost, getPostComments} from "../services/post.service.js";

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
        const deletedPost = await deletePost(req.params, { userId: req.params.userId });
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

export const likeAndUnlikePostController = async (req, res) => {
    try {
        const post = await likeAndUnlikePost(req.params, req.body);
        res.status(200).json({
            post,
            message: "Post liked or unliked successfully",
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Post like/unlike failed",
            error,
        });
    }
};

export const getPostController = async (req, res) => {
    try {
        const post = await getPost(req.params);
        res.status(200).json({
            post,
            message: "Post fetched successfully",
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Post fetching failed",
            error,
        });
    }
};

export const getTimelinePostsController = async (req, res) => {
    try {
        const timeLinePosts = await getTimelinePosts({ userId: req.params.userId });
        res.status(200).json({
            timeLinePosts,
            message: "Timeline posts fetch Succesfully"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Timeline posts fetching failed",
            error,
        });
    }
};

export const commentPostController = async (req, res) => {
    try {
        const post = await commentPost(req.params, req.body);
        res.status(200).json({
            post,
            message: "Comment added successfully",
        });
    } catch (error) {
        console.log(error);
        
        // Manejo específico de errores
        if (error.message === "Post not found") {
            return res.status(404).json({
                message: "Post not found",
                error: error.message,
            });
        }
        
        if (error.message === "User not found") {
            return res.status(404).json({
                message: "User not found",
                error: error.message,
            });
        }
        
        if (error.message === "Invalid post ID" || error.message === "Invalid user ID") {
            return res.status(400).json({
                message: "Invalid ID format",
                error: error.message,
            });
        }
        
        if (error.message === "Comment text is required") {
            return res.status(400).json({
                message: "Comment text is required",
                error: error.message,
            });
        }
        
        // Error genérico del servidor
        res.status(500).json({
            message: "Commenting on post failed",
            error: error.message,
        });
    }
};

export const getPostCommentsController = async (req, res) => {
    try {
        const comments = await getPostComments(req.params);
        res.status(200).json({
            comments,
            message: "Comments fetched successfully",
        });
    } catch (error) {
        console.log(error);
        
        if (error.message === "Post not found") {
            return res.status(404).json({
                message: "Post not found",
                error: error.message,
            });
        }
        
        if (error.message === "Invalid post ID") {
            return res.status(400).json({
                message: "Invalid post ID format",
                error: error.message,
            });
        }
        
        res.status(500).json({
            message: "Failed to fetch comments",
            error: error.message,
        });
    }
};