import express from "express";
import {
  listMessagesController,
  sendMessageController,
} from "../controllers/message.controller.js";

const router = express.Router();

router.get("/:conversationId", listMessagesController);
router.post("/", sendMessageController);

export default router;
