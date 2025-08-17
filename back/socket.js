import { Server } from "socket.io";
const parseOrigins = () => {
  const fromEnv = (process.env.SOCKET_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const defaults = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
  ];
  return Array.from(new Set([...defaults, ...fromEnv]));
};

export function setupSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: parseOrigins(),
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake?.auth?.userId || socket.handshake?.query?.userId;
    console.log("[ws] connection", socket.id, "auth:", socket.handshake?.auth, "query:", socket.handshake?.query, "origin:", socket.handshake?.headers?.origin);

    if (!userId) {
      console.warn("[ws] ❗ Sin userId, desconectando", socket.id);
      socket.disconnect(true);
      return;
    }

    socket.join(`user:${userId}`);
    const size = io.sockets.adapter.rooms.get(`user:${userId}`)?.size || 0;
    console.log(`[ws] ${socket.id} joined room user:${userId} (peers: ${size})`);

    socket.on("disconnect", (reason) => {
      console.log("[ws] disconnect", socket.id, reason);
    });
  });

  io.engine.on("connection_error", (err) => {
    console.error("[ws] engine connection_error", err.code, err.message, err.context);
  });

  return io;
}
