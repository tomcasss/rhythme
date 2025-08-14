import { Server } from "socket.io";

export function setupSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake?.auth?.userId || socket.handshake?.query?.userId;
    console.log("connection", socket.id, "auth:", socket.handshake?.auth);

    if (!userId) {
      console.warn("❗Sin userId, desconectando", socket.id);
      socket.disconnect(true);
      return;
    }

    socket.join(`user:${userId}`);
    console.log(`${socket.id} joined room user:${userId}`);

    socket.on("disconnect", (reason) => {
      console.log("disconnect", socket.id, reason);
    });
  });

  io.engine.on("connection_error", (err) => {
    console.error("engine connection_error", err.code, err.message, err.context);
  });

  return io;
}
