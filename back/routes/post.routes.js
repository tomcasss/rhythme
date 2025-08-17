import express from "express";
import { commentPostController, createPostController, deletePostController, getPostController, getPostCommentsController, getTimelinePostsController, getUserPostsController, likeAndUnlikePostController, updatePostController, getRecommendedPostsController } from "../controllers/post.controller.js";
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
router.get('/recommended/:userId', getRecommendedPostsController);
// Obtener todos los posts (básico)
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().populate('userId', 'username email profilePicture').lean();
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los posts', error });
  }
});

// Buscar posts por palabra clave en la descripción (?q=texto)
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) {
      return res.status(400).json({ message: 'Parámetro q requerido' });
    }
    const regex = new RegExp(q.trim(), 'i');
    const posts = await Post.find({ desc: { $regex: regex } })
      .populate('userId', 'username email profilePicture')
      .sort({ createdAt: -1 })
      .limit(50);
    res.status(200).json({ posts, count: posts.length });
  } catch (error) {
    res.status(500).json({ message: 'Error en búsqueda de posts', error: error.message || error });
  }
});


export default router;