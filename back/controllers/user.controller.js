import { deleteUser, getUser, updateUser, followUser, unFollowUser, searchUsers, getFriendRecommendations } from "../services/user.service.js";

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
      await deleteUser(req.params.id);
      res.status(200).json({
        message: "User deleted successfully",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  } else {
    res.status(500).json("You can only delete your own account!");
  }
};

export const getUserController = async (req, res) => {
  try {
    const user = await getUser(req.params.id);
    const { password, ...data } = user._doc;
    res.status(200).json({
      user: data,
      message: "User retrieved successfully",
    });
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