import express from "express";
import { commentPostController, createPostController, deletePostController, getPostController, getPostCommentsController, getTimelinePostsController, getUserPostsController, likeAndUnlikePostController, updatePostController } from "../controllers/post.controller.js";
import Post from "../models/post.model.js";

const router = express.Router();

router.post("/create-post", createPostController);
router.put("/update-post/:id", updatePostController);
router.delete("/delete-post/:id/:userId", deletePostController);
router.put("/like-post/:id", likeAndUnlikePostController);
router.get("/get-post/:id", getPostController);
router.get("/get-timeline-posts/:userId", getTimelinePostsController);
router.get("/get-user-posts/:userId", getUserPostsController);
router.post("/comment-post/:id", commentPostController);
router.get("/get-comments/:id", getPostCommentsController);
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().populate('userId', 'username email');
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los posts', error });
  }
});


export default router;