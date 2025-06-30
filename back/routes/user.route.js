import express from 'express';
import { deleteUserController, getUserController, updateUserController, followUserController, unFollowUserController } from '../controllers/user.controller.js';


const router = express.Router();

//Update user profile
router.put('/:id', updateUserController);
// Delete user profile
router.delete('/:id', deleteUserController);
// Get user profile
router.get('/:id', getUserController);
//Follow a user
router.put('/follow/:id', followUserController);
//Unfollow a user
router.put('/unfollow/:id', unFollowUserController);

export default router;