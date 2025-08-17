// back/controllers/post.controller.js
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
import { isVisibilityAllowed } from "../services/user.service.js";
import { emitToUser, emitPostEvent } from "../utils/realtime.js";

export const createPostController = async (req, res) => {
  try {
    console.log("Creating new post with data:", req.body);
    const newPost = await createPost(req.body);
    console.log("✅ Post created successfully:", newPost);
  // Emit event to owner so their feed updates immediately
  emitPostEvent(req, "created", newPost);
    res.status(200).json({ newPost, message: "Post created successfully" });
  } catch (error) {
    console.error(" Error creating post:", error);
    res.status(500).json({ message: "Post creation failed", error });
  }
};

export const updatePostController = async (req, res) => {
  try {
    const updatedPost = await updatePost(req.params, req.body);
  emitPostEvent(req, "updated", updatedPost);
    res.status(200).json({ updatedPost, message: "Post updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Post update failed", error });
  }
};

export const deletePostController = async (req, res) => {
  try {
    const deletedPost = await deletePost(req.params, {
      userId: req.params.userId,
      isAdmin:
        req.body?.isAdmin ||
        req.query?.isAdmin ||
        req.headers["x-admin"] === "true",
    });
  if (deletedPost) emitPostEvent(req, "deleted", deletedPost);
    res.status(200).json({ deletedPost, message: "Post deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Post deletion failed",
      error: error.message || error,
    });
  }
};

export const likeAndUnlikePostController = async (req, res) => {
  try {
    const postBefore = await getPost(req.params);
    if (!postBefore) return res.status(404).json({ message: "Post not found" });

    const owner = await User.findById(postBefore.userId);
    const viewer = req.body.userId ? await User.findById(req.body.userId) : null;
    if (!isVisibilityAllowed(viewer, owner, "posts")) {
      return res
        .status(403)
        .json({ message: "Not allowed to interact with this post" });
    }

    const wasAlreadyLiked = postBefore.likes.includes(req.body.userId);
  const post = await likeAndUnlikePost(req.params, req.body);
  emitPostEvent(req, "liked", post, { actorId: req.body.userId });

    // notifica like (solo la primera vez y no al autor)
    if (!wasAlreadyLiked && post.userId.toString() !== req.body.userId) {
      const liker = await User.findById(req.body.userId);
      if (liker) {
        const notif = await createNotification({
          userId: post.userId,
          type: "like",
          postId: post._id,
          message: `${liker.username} le dio like a tu publicación 👍🏻`,
        });
    await emitToUser(req, notif.userId, "notification:new", {
          _id: String(notif._id),
          type: notif.type,
          message: notif.message,
          postId: notif.postId,
          link: notif.link,
          isRead: notif.isRead,
          createdAt: notif.createdAt,
        });
      }
  } // ← **esta llave faltaba**

    res
      .status(200)
      .json({ post, message: "Post liked or unliked successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Post like/unlike failed", error });
  }
};

export const getPostController = async (req, res) => {
  try {
    const post = await getPost(req.params);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const owner = await User.findById(post.userId);
    const viewerId = req.query.viewerId || req.body.userId;
    const viewer = viewerId ? await User.findById(viewerId) : null;

    if (!isVisibilityAllowed(viewer, owner, "posts")) {
      return res.status(403).json({ message: "Post not visible" });
    }

    res.status(200).json({ post, message: "Post fetched successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Post fetching failed", error });
  }
};

export const getTimelinePostsController = async (req, res) => {
  try {
    const viewer = await User.findById(req.params.userId);
    const allPosts = await getTimelinePosts({ userId: req.params.userId });

    // Filtrar por visibilidad y bloqueo
    const filtered = [];
    for (const p of allPosts) {
      const owner = p.userId?._id ? p.userId : await User.findById(p.userId);
      if (!owner) continue;
      if (!isVisibilityAllowed(viewer, owner, "posts")) continue;
      if (
        owner.accountStatus &&
        owner.accountStatus !== "active" &&
        String(owner._id) !== String(viewer?._id)
      )
        continue;
      filtered.push(p);
    }

    res
      .status(200)
      .json({ timeLinePosts: filtered, message: "Timeline posts fetch Succesfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Timeline posts fetching failed", error });
  }
};

export const commentPostController = async (req, res) => {
  try {
    const pre = await getPost(req.params);
    if (!pre) return res.status(404).json({ message: "Post not found" });

    const owner = await User.findById(pre.userId);
    const viewer = req.body.userId ? await User.findById(req.body.userId) : null;
    if (!isVisibilityAllowed(viewer, owner, "posts")) {
      return res
        .status(403)
        .json({ message: "Not allowed to comment this post" });
    }

  const post = await commentPost(req.params, req.body);
  emitPostEvent(req, "commented", post, { actorId: req.body.userId });

    if (
      post &&
      post._id &&
      req.body.userId &&
      post.userId.toString() !== req.body.userId
    ) {
      const commenter = await User.findById(req.body.userId);
      if (commenter) {
        const notif = await createNotification({
          userId: post.userId,
          type: "comment",
          postId: post._id,
          message: `${commenter.username} comentó en tu publicación 💬`,
        });
  await emitToUser(req, notif.userId, "notification:new", {
          _id: String(notif._id),
          type: notif.type,
          message: notif.message,
          postId: notif.postId,
          link: notif.link,
          isRead: notif.isRead,
          createdAt: notif.createdAt,
        });
      }
    }

    res.status(200).json({ post, message: "Comment added successfully" });
  } catch (error) {
    console.log(error);

    if (error.message === "Post not found") {
      return res
        .status(404)
        .json({ message: "Post not found", error: error.message });
    }
    if (error.message === "User not found") {
      return res
        .status(404)
        .json({ message: "User not found", error: error.message });
    }
    if (
      error.message === "Invalid post ID" ||
      error.message === "Invalid user ID"
    ) {
      return res
        .status(400)
        .json({ message: "Invalid ID format", error: error.message });
    }
    if (error.message === "Comment text is required") {
      return res
        .status(400)
        .json({ message: "Comment text is required", error: error.message });
    }

    res
      .status(500)
      .json({ message: "Commenting on post failed", error: error.message });
  }
};

export const getPostCommentsController = async (req, res) => {
  try {
    const comments = await getPostComments(req.params);
    res
      .status(200)
      .json({ comments, message: "Comments fetched successfully" });
  } catch (error) {
    console.log(error);

    if (error.message === "Post not found") {
      return res
        .status(404)
        .json({ message: "Post not found", error: error.message });
    }
    if (error.message === "Invalid post ID") {
      return res
        .status(400)
        .json({ message: "Invalid post ID format", error: error.message });
    }

    res
      .status(500)
      .json({ message: "Failed to fetch comments", error: error.message });
  }
};

export const getUserPostsController = async (req, res) => {
  try {
    const posts = await getUserPosts(req.params);
    const owner = posts?.[0]?.userId
      ? posts[0].userId._id
        ? posts[0].userId
        : await User.findById(req.params.userId)
      : await User.findById(req.params.userId);

    const viewerId = req.query.viewerId || req.body.userId;
    const viewer = viewerId ? await User.findById(viewerId) : null;

    if (
      owner &&
      !isVisibilityAllowed(viewer, owner, "posts") &&
      String(owner._id) !== String(viewer?._id)
    ) {
      return res.status(403).json({ message: "User posts not visible" });
    }

    res.status(200).json({ posts, message: "User posts fetched successfully" });
  } catch (error) {
    console.log(error);

    if (error.message === "Invalid user ID") {
      return res
        .status(400)
        .json({ message: "Invalid user ID format", error: error.message });
    }

    res
      .status(500)
      .json({ message: "Failed to fetch user posts", error: error.message });
  }
};

export const getRecommendedPostsController = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit } = req.query;

    const postsRaw = await getRecommendedPosts(userId, {
      limit: limit ? Number(limit) : 20,
    });

    const viewer = await User.findById(userId);
    const filtered = [];
    for (const p of postsRaw) {
      const owner = p.userId?._id ? p.userId : await User.findById(p.userId);
      if (!owner) continue;
      if (!isVisibilityAllowed(viewer, owner, "posts")) continue;
      if (
        owner.accountStatus &&
        owner.accountStatus !== "active" &&
        String(owner._id) !== String(viewer?._id)
      )
        continue;
      filtered.push(p);
    }

    res
      .status(200)
      .json({ posts: filtered, message: "Recommended posts fetched successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed to fetch recommended posts",
      error: error.message || error,
    });
  }
};
