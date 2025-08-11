import bcrypt from "bcrypt";
import userModel from "../models/user.model.js";
import ReportModel from "../models/report.model.js";
import { createNotification } from "./notification.service.js";
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
  const myBlocked = new Set((me.blockedUsers || []).map(String));

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

    // Filtrar usuarios bloqueados, que me bloquearon o desactivados
    const filtered = users.filter(u => {
      if (u.accountStatus && u.accountStatus !== 'active') return false;
      if (myBlocked.has(String(u._id))) return false;
      if ((u.blockedUsers || []).some(b => String(b) === String(userId))) return false;
      return true;
    });

    // Mantener orden por ranking
    const order = new Map(ids.map((id, idx) => [id, idx]));
  filtered.sort((a, b) => (order.get(String(a._id)) ?? 0) - (order.get(String(b._id)) ?? 0));

  return filtered.map(u => ({ ...u, recommendationScore: candidateCounts.get(String(u._id)) || 0 }));
  } catch (error) {
    throw error;
  }
};

// ----- Nuevos Servicios de Configuración y Privacidad -----

export const changePassword = async (userId, currentPassword, newPassword) => {
  if (!newPassword || newPassword.length < 6) {
    throw new Error('New password must be at least 6 characters');
  }
  const user = await userModel.findById(userId);
  if (!user) throw new Error('User not found');
  if (user.authProvider !== 'local') {
    throw new Error('Password change not allowed for external provider account');
  }
  const ok = await bcrypt.compare(currentPassword, user.password);
  if (!ok) throw new Error('Current password incorrect');
  user.password = bcrypt.hashSync(newPassword, 10);
  user.passwordUpdatedAt = new Date();
  await user.save();
  return { success: true };
};

export const updatePrivacySettings = async (userId, privacy) => {
  const allowed = ['public', 'followers', 'private'];
  const sanitized = {};
  ['profile', 'posts', 'friends'].forEach(k => {
    if (privacy?.[k]) {
      if (!allowed.includes(privacy[k])) {
        throw new Error(`Invalid privacy value for ${k}`);
      }
      sanitized[`privacy.${k}`] = privacy[k];
    }
  });
  if (!Object.keys(sanitized).length) throw new Error('No valid privacy fields provided');
  const user = await userModel.findByIdAndUpdate(userId, { $set: sanitized }, { new: true }).select('-password');
  if (!user) throw new Error('User not found');
  return user;
};

export const blockUser = async (actorId, targetId) => {
  if (actorId === targetId) throw new Error('Cannot block yourself');
  const actor = await userModel.findById(actorId);
  if (!actor) throw new Error('User not found');
  if (!actor.blockedUsers) actor.blockedUsers = [];
  const already = actor.blockedUsers.map(String).includes(String(targetId));
  if (already) return { success: true, message: 'Already blocked' };
  actor.blockedUsers.push(targetId);
  await actor.save();
  return { success: true };
};

export const unblockUser = async (actorId, targetId) => {
  const actor = await userModel.findById(actorId);
  if (!actor) throw new Error('User not found');
  actor.blockedUsers = (actor.blockedUsers || []).filter(id => String(id) !== String(targetId));
  await actor.save();
  return { success: true };
};

export const deactivateAccount = async (userId) => {
  const user = await userModel.findByIdAndUpdate(userId, { $set: { accountStatus: 'desactivado' } }, { new: true }).select('-password');
  if (!user) throw new Error('User not found');
  return user;
};

export const reactivateAccount = async (userId) => {
  const user = await userModel.findByIdAndUpdate(userId, { $set: { accountStatus: 'active' } }, { new: true }).select('-password');
  if (!user) throw new Error('User not found');
  return user;
};

export const softDeleteAccount = async (userId) => {
  const user = await userModel.findByIdAndUpdate(userId, { $set: { accountStatus: 'deletedPending', deletedAt: new Date() } }, { new: true }).select('-password');
  if (!user) throw new Error('User not found');
  return user;
};

export const hardDeleteAccount = async (userId) => {
  await userModel.findByIdAndDelete(userId);
  return { success: true };
};

export const isVisibilityAllowed = (viewer, owner, section) => {
  // section: 'profile' | 'posts' | 'friends'
  const setting = owner?.privacy?.[section] || 'public';
  if (String(owner._id) === String(viewer?._id)) return true; // owner always
  // bloqueos
  const viewerId = viewer?._id && String(viewer._id);
  const ownerId = owner?._id && String(owner._id);
  if (owner.blockedUsers?.some(id => String(id) === viewerId)) return false;
  if (viewer?.blockedUsers?.some(id => String(id) === ownerId)) return false;
  if (setting === 'public') return true;
  if (setting === 'followers') {
    return owner.followers?.some(id => String(id) === viewerId);
  }
  if (setting === 'private') return false;
  return true;
};

// ----- Reportes de usuarios -----
export const reportUser = async ({ reporterId, targetUserId, targetPostId = null, reason, description }) => {
  if (reporterId === targetUserId) throw new Error('Cannot report yourself');
  const today = new Date();
  const since = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const existing = await ReportModel.findOne({ reporterId, targetUserId, targetPostId, createdAt: { $gte: since } });
  if (existing) {
    return { throttled: true };
  }
  const doc = await ReportModel.create({ reporterId, targetUserId, targetPostId, reason, description });
  return { success: true, report: doc };
};

export const listReports = async ({ status = 'open', limit = 50 } = {}) => {
  const query = status ? { status } : {};
  return ReportModel.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('reporterId', 'username email')
    .populate('targetUserId', 'username email')
    .populate('targetPostId', 'desc createdAt')
    .lean();
};

export const markReportReviewed = async (reportId, { adminResponseMessage, adminId } = {}) => {
  const update = { status: 'reviewed' };
  if (adminResponseMessage) {
    update.adminResponse = { message: adminResponseMessage, adminId, respondedAt: new Date() };
  }
  const report = await ReportModel.findByIdAndUpdate(reportId, { $set: update }, { new: true })
    .populate('reporterId', 'username email')
    .populate('targetUserId', 'username email')
    .populate('targetPostId', 'desc createdAt');
  if (!report) throw new Error('Report not found');
  if (adminResponseMessage && report.reporterId?._id) {
    try {
      await createNotification({
        userId: report.reporterId._id,
        type: 'report_response',
        message: adminResponseMessage,
        postId: report.targetPostId?._id || null
      });
    } catch (e) {
      console.warn('Failed to create report response notification', e?.message || e);
    }
  }
  return report;
};
