import { deleteUser, getUser, updateUser, followUser, unFollowUser, searchUsers, getFriendRecommendations, changePassword, updatePrivacySettings, blockUser, unblockUser, deactivateAccount, reactivateAccount, softDeleteAccount, hardDeleteAccount, isVisibilityAllowed, reportUser, listReports, markReportReviewed } from "../services/user.service.js";

export const updateUserController = async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    // Allow update if the user is updating their own profile or is an admin
    try {
      const user = await updateUser(req.params.id, req.body);
      res.status(200).json({
        user,
        message: "User updated successfully",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  } else {
    res.status(500).json("You can only update your own account!");
  }
};

export const deleteUserController = async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const hard = req.query.hard === 'true';
      if (hard) {
        await hardDeleteAccount(req.params.id);
        return res.status(200).json({ message: 'User permanently deleted' });
      }
      const user = await softDeleteAccount(req.params.id);
      res.status(200).json({ message: 'User marked for deletion', user });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Delete failed', error: error.message || error });
    }
  } else {
    res.status(403).json("You can only delete your own account!");
  }
};

export const getUserController = async (req, res) => {
  try {
    const user = await getUser(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    // viewer info (simplificado: se pasa viewerId por query/body si existe)
    let viewer = null;
    if (req.query.viewerId) {
      if (req.query.viewerId === req.params.id) {
        // Es el propio usuario, asignamos directamente para que pase la verificación
        viewer = user;
      } else {
        viewer = await getUser(req.query.viewerId).catch(() => null);
      }
    }
    if (!isVisibilityAllowed(viewer, user, 'profile')) {
      return res.status(403).json({ message: 'Profile not visible' });
    }
    const { password, ...data } = user._doc;
    res.status(200).json({ user: data, message: 'User retrieved successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

export const followUserController = async (req, res) => {
  try {
    const data = await followUser(req.body, req.params);
    res.status(200).json({
      data,
      message: "User followed successfully",
    });
  } catch (error) {
    console.log(error);
    
    // Manejar errores específicos
    if (error.message === "You already follow this user" || 
        error.message === "You cannot follow yourself") {
      res.status(400).json({
        message: error.message,
        error: error.message
      });
    } else {
      res.status(500).json({
        message: "Error following user",
        error: error.message || error
      });
    }
  }
};

export const unFollowUserController = async (req, res) => {
  try {
    const data = await unFollowUser(req.body, req.params);
    res.status(200).json({
      data,
      message: "User unfollowed successfully",
    });
  } catch (error) {
    console.log(error);
    
    // Manejar errores específicos
    if (error.message === "You don't follow this user" || 
        error.message === "You cannot unfollow yourself") {
      res.status(400).json({
        message: error.message,
        error: error.message
      });
    } else {
      res.status(500).json({
        message: "Error unfollowing user",
        error: error.message || error
      });
    }
  }
};

export const searchUsersController = async (req, res) => {
  try {
    const { q } = req.query;
    const users = await searchUsers(q);
    res.status(200).json({
      users,
      message: "Users found successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error searching users",
      error,
    });
  }
};

export const getFriendRecommendationsController = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit } = req.query;
    const suggestions = await getFriendRecommendations(userId, limit ? Number(limit) : 10);
    res.status(200).json({ suggestions, message: 'Friend recommendations fetched successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed to fetch friend recommendations', error: error.message || error });
  }
};

// ----- Nuevos controladores -----

export const changePasswordController = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (req.body.userId !== req.params.id) {
    return res.status(403).json({ message: 'You can only change your own password' });
  }
  try {
    const result = await changePassword(req.params.id, currentPassword, newPassword);
    res.status(200).json({ message: 'Password updated', result });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Password change failed' });
  }
};

export const updatePrivacyController = async (req, res) => {
  if (req.body.userId !== req.params.id) {
    return res.status(403).json({ message: 'You can only update your own privacy settings' });
  }
  try {
    const user = await updatePrivacySettings(req.params.id, req.body.privacy || {});
    res.status(200).json({ message: 'Privacy updated', user });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Privacy update failed' });
  }
};

export const blockUserController = async (req, res) => {
  const actorId = req.params.id;
  const targetId = req.params.targetId;
  if (req.body.userId !== actorId) return res.status(403).json({ message: 'Forbidden' });
  try {
    const result = await blockUser(actorId, targetId);
    res.status(200).json({ message: 'User blocked', result });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Block failed' });
  }
};

export const unblockUserController = async (req, res) => {
  const actorId = req.params.id;
  const targetId = req.params.targetId;
  if (req.body.userId !== actorId) return res.status(403).json({ message: 'Forbidden' });
  try {
    const result = await unblockUser(actorId, targetId);
    res.status(200).json({ message: 'User unblocked', result });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Unblock failed' });
  }
};

export const deactivateAccountController = async (req, res) => {
  if (req.body.userId !== req.params.id) return res.status(403).json({ message: 'Forbidden' });
  try {
    const user = await deactivateAccount(req.params.id);
    res.status(200).json({ message: 'Account deactivated', user });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Deactivate failed' });
  }
};

export const reactivateAccountController = async (req, res) => {
  if (req.body.userId !== req.params.id) return res.status(403).json({ message: 'Forbidden' });
  try {
    const user = await reactivateAccount(req.params.id);
    res.status(200).json({ message: 'Account reactivated', user });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Reactivate failed' });
  }
};

export const reportUserController = async (req, res) => {
  const reporterId = req.body.userId;
  const targetUserId = req.params.id;
  const { reason, description } = req.body;
  if (!reporterId) return res.status(400).json({ message: 'Missing reporterId' });
  try {
    const result = await reportUser({ reporterId, targetUserId, reason, description });
    if (result.throttled) return res.status(429).json({ message: 'Report already submitted in last 24h' });
    res.status(201).json({ message: 'Report submitted', report: result.report });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Report failed' });
  }
};

export const listReportsController = async (req, res) => {
  // Simple: require isAdmin flag in body (placeholder auth)
  if (!req.body.isAdmin) return res.status(403).json({ message: 'Admin only' });
  try {
    const reports = await listReports({ status: req.query.status, limit: req.query.limit ? Number(req.query.limit) : 50 });
    res.status(200).json({ reports, message: 'Reports listed' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'List reports failed' });
  }
};

export const markReportReviewedController = async (req, res) => {
  if (!req.body.isAdmin) return res.status(403).json({ message: 'Admin only' });
  try {
    const report = await markReportReviewed(req.params.reportId);
    res.status(200).json({ message: 'Report marked as reviewed', report });
  } catch (error) {
    res.status(404).json({ message: error.message || 'Update failed' });
  }
};