import express from "express";
import { createPostController, deletePostController, updatePostController } from "../controllers/post.controller.js";
const router = express.Router();

router.post("/create-post", createPostController);
router.put("/update-post/:id", updatePostController);
router.delete("/delete-post/:id", deletePostController);

export default router;