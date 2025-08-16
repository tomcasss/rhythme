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
