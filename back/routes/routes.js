import express from 'express';
import userRoutes from './user.route.js';
import authRoutes from './auth.route.js';
import postRoutes from './post.routes.js';
import spotifyRoutes from './spotify.routes.js';
import notificationRoutes from './notification.routes.js';
import conversationRoutes from "./conversation.routes.js";
import messageRoute from "./message.route.js";

const router = express.Router();

const baseURL = 'api/v1';

router.use(`/${baseURL}/users`, userRoutes);
router.use(`/${baseURL}/auth`, authRoutes);
router.use(`/${baseURL}/posts`, postRoutes);
router.use(`/${baseURL}/spotify`, spotifyRoutes);
router.use(`/${baseURL}/notifications`, notificationRoutes);
router.use(`/${baseURL}/conversations`, conversationRoutes);
router.use(`/${baseURL}/messages`, messageRoute);

export default router;