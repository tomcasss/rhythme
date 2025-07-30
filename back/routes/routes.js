import express from 'express';
import userRoutes from './user.route.js';
import authRoutes from './auth.route.js';
import postRoutes from './post.routes.js';
import spotifyRoutes from './spotify.routes.js';
import notificationRoutes from './notification.routes.js';

const router = express.Router();

const baseURL = 'api/v1';

router.use(`/${baseURL}/users`, userRoutes);
router.use(`/${baseURL}/auth`, authRoutes);
router.use(`/${baseURL}/posts`, postRoutes);
router.use(`/${baseURL}/spotify`, spotifyRoutes);
router.use(`/${baseURL}/notifications`, notificationRoutes);

export default router;