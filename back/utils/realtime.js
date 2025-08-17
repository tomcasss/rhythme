import User from "../models/user.model.js";
export function emitToUser(req, userIdLike, event, payload) {
  try {
    const io = req.app.get("io");
    if (!io) return;

    const id =
      typeof userIdLike === "string"
        ? userIdLike
        : userIdLike?.toHexString?.() ||
          userIdLike?._id?.toHexString?.() ||
          (userIdLike?._id ? String(userIdLike._id) : String(userIdLike));

    const room = `user:${id}`;
    const size = io.sockets.adapter.rooms.get(room)?.size || 0;
    console.log(`[ws] emit ${event} -> ${room} (sockets: ${size})`);

    io.to(room).emit(event, payload);
  } catch (e) {
    console.error("emitToUser error:", e);
  }
}

export function emitToUsers(req, userIds, event, payload) {
  try {
    const io = req.app.get("io");
    if (!io) return;
    const rooms = (userIds || []).map((id) => `user:${String(id)}`);
    console.log(`[ws] emit ${event} -> many (${rooms.length})`);
    if (rooms.length) io.to(rooms).emit(event, payload);
  } catch (e) {
    console.error("emitToUsers error:", e);
  }
}

export function emitPostEvent(req, type, post, extra = {}) {
  try {
    const io = req.app.get("io");
    if (!io || !post) return;
    const ownerId = String(post.userId?._id || post.userId);

    // Fetch owner minimal profile + followers once
    User.findById(ownerId)
      .select("username email profilePicture followers")
      .lean()
      .then((owner) => {
        const ownerProfile = owner
          ? {
              _id: String(owner._id),
              username: owner.username,
              email: owner.email,
              profilePicture: owner.profilePicture,
            }
          : (typeof post.userId === 'object'
              ? {
                  _id: String(post.userId._id),
                  username: post.userId.username,
                  email: post.userId.email,
                  profilePicture: post.userId.profilePicture,
                }
              : { _id: ownerId });

        const payload = {
          type,
          post: {
            _id: String(post._id),
            userId: ownerProfile, // enriched author info for UI
            desc: post.desc,
            img: post.img,
            likes: post.likes || [],
            commentsCount: Array.isArray(post.comments) ? post.comments.length : 0,
            spotifyContent: post.spotifyContent || null,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
          },
          ...extra,
        };

        // Emit to owner
        io.to(`user:${ownerId}`).emit("post:event", payload);

        // Emit to followers to refresh their timelines
        const followers = (owner?.followers || []).map(String).filter(Boolean);
        if (followers.length) {
          const rooms = followers.map((id) => `user:${id}`);
          io.to(rooms).emit("post:event", payload);
        }
      })
      .catch((e) => {
        console.warn("emitPostEvent owner fetch failed:", e?.message || e);
      });
  } catch (e) {
    console.error("emitPostEvent error:", e);
  }
}
