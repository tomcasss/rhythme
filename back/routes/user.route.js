import express from 'express';
import { deleteUserController, getUserController, updateUserController, followUserController, unFollowUserController, searchUsersController, getFriendRecommendationsController, changePasswordController, updatePrivacyController, blockUserController, unblockUserController, deactivateAccountController, reactivateAccountController, reportUserController, listReportsController, markReportReviewedController } from '../controllers/user.controller.js';
import User from "../models/user.model.js";


const router = express.Router();

// Search users
router.get('/search', searchUsersController);
// Friend recommendations
router.get('/:userId/recommendations/friends', getFriendRecommendationsController);
//Update user profile
router.put('/:id', updateUserController);
// Change password
router.patch('/:id/password', changePasswordController);
// Update privacy settings
router.patch('/:id/privacy', updatePrivacyController);
// Block user
router.post('/:id/block/:targetId', blockUserController);
// Unblock user
router.delete('/:id/block/:targetId', unblockUserController);
// Deactivate account
router.patch('/:id/deactivate', deactivateAccountController);
// Reactivate account
router.patch('/:id/reactivate', reactivateAccountController);
// Report user
router.post('/:id/report', reportUserController);
// List reports (admin)
router.get('/reports/all', listReportsController);
// Mark report reviewed
router.patch('/reports/:reportId/review', markReportReviewedController);
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
