import express from "express";
import {
  listUserConversationsController,
  getOrCreateConversationController,
} from "../controllers/conversation.controller.js";

const router = express.Router();

router.get("/user/:userId", listUserConversationsController);
router.post("/open", getOrCreateConversationController);

export default router;
