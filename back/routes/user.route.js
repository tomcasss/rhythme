import express from 'express';
import { deleteUserController, getUserController, updateUserController, followUserController, unFollowUserController, searchUsersController } from '../controllers/user.controller.js';
import User from "../models/user.model.js";


const router = express.Router();

// Search users
router.get('/search', searchUsersController);
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
// GET ALL USERS admin
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password'); 
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los usuarios', error });
  }
});


export default router;
