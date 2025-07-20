import bcrypt from "bcrypt";
import userModel from "../models/user.model.js";

export const updateUser = async (userId, updateData) => {
  if (updateData.password) {
    try {
      updateData.password = await bcrypt.hashSync(updateData.password, 10);
    } catch (error) {
      throw error;
    }
  }
  try {
    const user = await userModel.findByIdAndUpdate(
      userId,
      {
        $set: updateData,
      },
      { new: true }
    );
    return user;
  } catch (error) {
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    await userModel.findByIdAndDelete(userId);
  } catch (error) {
    throw error;
  }
};

export const getUser = async (userId) => {
  try {
    const user = await userModel.findById(userId);
    return user;
  } catch (error) {
    throw error;
  }
};

export const followUser = async (userData, updateData) => {
  if (userData.userId === updateData.id) {
    throw new Error("You cannot follow yourself");
  } else {
    try {
      const user = await userModel.findById(userData.userId);
      const currentUser = await userModel.findById(updateData.id);
      
      // Verificar si ya sigue al usuario objetivo
      if (!user.following.includes(updateData.id)) {
        await currentUser.updateOne({ $push: { followers: userData.userId } });
        await user.updateOne({ $push: { following: updateData.id } });
        return { user, currentUser };
      } else {
        throw new Error("You already follow this user");
      }
    } catch (error) {
      throw error;
    }
  }
};

export const unFollowUser = async (userData, updateData) => {
  if (userData.userId === updateData.id) {
    throw new Error("You cannot unfollow yourself");
  } else {
    try {
      const user = await userModel.findById(userData.userId);
      const currentUser = await userModel.findById(updateData.id);
      
      // Verificar si realmente sigue al usuario objetivo
      if (user.following.includes(updateData.id)) {
        await currentUser.updateOne({ $pull: { followers: userData.userId } }, { new: true });
        await user.updateOne({ $pull: { following: updateData.id} }, { new: true });
        return { user, currentUser };
      } else {
        throw new Error("You don't follow this user");
      }
    } catch (error) {
      throw error;
    }
  }
};

export const searchUsers = async (query) => {
  try {
    if (!query || query.trim() === '') {
      return [];
    }
    
    // Buscar usuarios por username, email o descripción
    const users = await userModel.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { desc: { $regex: query, $options: 'i' } },
        { name: { $regex: query, $options: 'i' } },
        { from: { $regex: query, $options: 'i' } }
      ]
    }).select('-password').limit(20); // Excluir password y limitar resultados
    
    return users;
  } catch (error) {
    throw error;
  }
};
