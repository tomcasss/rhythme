import express from 'express';
import { deleteUserController, getUserController, updateUserController } from '../controllers/user.controller.js';


const router = express.Router();

//Update user profile
router.put('/:id', updateUserController);
// Delete user profile
router.delete('/:id', deleteUserController);
// Get user profile
router.get('/:id', getUserController);

export default router;