import express from "express";
import {
  notifyUserController,
  getUserNotificationsController,
  markAsReadController,
} from "../controllers/notification.controller.js";

const router = express.Router();

router.post("/notify", notifyUserController);
router.get("/user/:userId", getUserNotificationsController);
router.put("/:id/read", markAsReadController);

export default router;
