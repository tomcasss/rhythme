import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import SocketCtx from './SocketContext.js';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:5000` : "http://localhost:5000");

export default function SocketProvider({ user, children }) {
  const [socket, setSocket] = useState(null);

/*   useEffect(() => {
  if (!socket) return;
  const logAny = (event, ...args) => console.log("[ws] ->", event, ...args);
  socket.onAny(logAny);
  return () => socket.offAny(logAny);
}, [socket]); */


  useEffect(() => {
    if (!user?._id) return;

  const s = io(SOCKET_URL, {
      auth: { userId: user._id },
      transports: ["websocket", "polling"],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 500,
    });

    s.on("connect", () => console.log("socket conectada:", s.id));
    s.on("disconnect", (reason) => console.log("🔌 disconnect:", reason));
    s.on("connect_error", (err) => console.error("connect_error:", err.message));

    setSocket(s);
    return () => s.disconnect();
  }, [user?._id]);

  return <SocketCtx.Provider value={socket}>{children}</SocketCtx.Provider>;
}
