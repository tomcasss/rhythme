import {
  createPost,
  deletePost,
  updatePost,
  likeAndUnlikePost,
  getPost,
  getTimelinePosts,
  commentPost,
  getPostComments,
  getUserPosts,
  getRecommendedPosts,
} from "../services/post.service.js";
import { createNotification } from "../services/notification.service.js";
import User from "../models/user.model.js";

export const createPostController = async (req, res) => {
  try {
    console.log("Creating new post with data:", req.body);
    const newPost = await createPost(req.body);
    console.log("✅ Post created successfully:", newPost);
    res.status(200).json({
      newPost,
      message: "Post created successfully",
    });
  } catch (error) {
    console.error(" Error creating post:", error);
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
    const deletedPost = await deletePost(req.params, {
      userId: req.params.userId,
    });
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
    const postBefore = await getPost(req.params);
    const wasAlreadyLiked = postBefore.likes.includes(req.body.userId);
    const post = await likeAndUnlikePost(req.params, req.body);
    //notifica like
    if (!wasAlreadyLiked && post.userId.toString() !== req.body.userId) {
      const liker = await User.findById(req.body.userId);
      if (liker) {
        await createNotification({
          userId: post.userId,
          type: "like",
          postId: post._id,
          message: `${liker.username} le dio like a tu publicación 👍🏻`
        });
      }
    }

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
      message: "Timeline posts fetch Succesfully",
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
    if (
      post &&
      post._id &&
      req.body.userId &&
      post.userId.toString() !== req.body.userId
    ) {
      const commenter = await User.findById(req.body.userId);
      if (commenter) {
        await createNotification({
          userId: post.userId,
          type: "comment",
          postId: post._id,
          message: `${commenter.username} comentó en tu publicación 💬`,
        });
      }
    }
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

    if (
      error.message === "Invalid post ID" ||
      error.message === "Invalid user ID"
    ) {
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

export const getUserPostsController = async (req, res) => {
  try {
    const posts = await getUserPosts(req.params);
    res.status(200).json({
      posts,
      message: "User posts fetched successfully",
    });
  } catch (error) {
    console.log(error);

    if (error.message === "Invalid user ID") {
      return res.status(400).json({
        message: "Invalid user ID format",
        error: error.message,
      });
    }

    res.status(500).json({
      message: "Failed to fetch user posts",
      error: error.message,
    });
  }
};

export const getRecommendedPostsController = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit } = req.query;
    const posts = await getRecommendedPosts(userId, { limit: limit ? Number(limit) : 20 });
    res.status(200).json({ posts, message: 'Recommended posts fetched successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed to fetch recommended posts', error: error.message || error });
  }
};
