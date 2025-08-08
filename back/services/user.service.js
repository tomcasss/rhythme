import bcrypt from "bcrypt";
import userModel from "../models/user.model.js";
import postModel from "../models/post.model.js";

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

// Recomendar amigos: amigos de mis amigos + personas con las que interactúo en posts
export const getFriendRecommendations = async (userId, limit = 10) => {
  try {
    const me = await userModel.findById(userId).lean();
    if (!me) return [];

    const alreadyFollowing = new Set((me.following || []).map(String));
    alreadyFollowing.add(String(userId)); // excluirme

    // 1) Amigos de mis amigos
    const myFriends = await userModel
      .find({ _id: { $in: Array.from(alreadyFollowing).filter(id => id !== String(userId)) } })
      .select('following')
      .lean();

    const candidateCounts = new Map();
    for (const friend of myFriends) {
      for (const cand of (friend.following || [])) {
        const candStr = String(cand);
        if (!alreadyFollowing.has(candStr)) {
          candidateCounts.set(candStr, (candidateCounts.get(candStr) || 0) + 1);
        }
      }
    }

    // 2) Boost por interacción en posts (likes/comentarios compartidos)
    const myInteractions = await postModel
      .find({
        $or: [
          { likes: { $in: [userId] } },
          { 'comments.userId': userId },
          { userId }, // autores que yo sigo posteando (para priorizar gente cercana)
        ],
      })
      .select('userId likes comments.userId')
      .lean();

    for (const p of myInteractions) {
      const author = String(p.userId);
      if (!alreadyFollowing.has(author)) {
        candidateCounts.set(author, (candidateCounts.get(author) || 0) + 2); // autor del post
      }
      for (const liker of (p.likes || [])) {
        const likerStr = String(liker);
        if (!alreadyFollowing.has(likerStr)) {
          candidateCounts.set(likerStr, (candidateCounts.get(likerStr) || 0) + 1);
        }
      }
      for (const c of (p.comments || [])) {
        const commenter = String(c.userId);
        if (!alreadyFollowing.has(commenter)) {
          candidateCounts.set(commenter, (candidateCounts.get(commenter) || 0) + 1);
        }
      }
    }

    // Ordenar por score descendente
    const ranked = Array.from(candidateCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);

    const ids = ranked.map(([id]) => id);
    if (!ids.length) return [];

    // Traer info pública de usuarios propuestos
    const users = await userModel
      .find({ _id: { $in: ids } })
      .select('-password')
      .lean();

    // Mantener orden por ranking
    const order = new Map(ids.map((id, idx) => [id, idx]));
    users.sort((a, b) => (order.get(String(a._id)) ?? 0) - (order.get(String(b._id)) ?? 0));

    // Adjuntar score
    return users.map(u => ({ ...u, recommendationScore: candidateCounts.get(String(u._id)) || 0 }));
  } catch (error) {
    throw error;
  }
};
