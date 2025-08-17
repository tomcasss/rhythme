import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../../config/api";
import { useSocket } from "../../lib/SocketContext.js";
import "./ChatWindow.css";  


export default function ChatWindow({ currentUser, conversation, onClose }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const listRef = useRef(null);
  const socket = useSocket();

  const peer = conversation?.participants?.find(
    (p) => p._id !== currentUser._id
  );

  //--------------Prueba de mensajes duplicados
  const seenIdsRef = useRef(new Set());

  const mergeUniqueById = (items) =>{
    const map = new Map();
    for (const item of items) {
      if  (item && item._id) map.set(String(item._id), item);
    }
    return Array.from(map.values());
  }
//----------------------Seccion uno de la prueba
  useEffect(() => {
    if (!conversation?._id) return;
    const load = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          API_ENDPOINTS.GET_MESSAGES(conversation._id)
        );
        setMessages(res.data || []);
      } catch (e) {
        console.error("Error cargando mensajes", e);
      } finally {
        setLoading(false);
        setTimeout(
          () => listRef.current?.scrollTo(0, listRef.current.scrollHeight),
          0
        );
      }
    };
    load();
  }, [conversation]);

  // live updates via socket
  useEffect(() => {
    if (!socket || !conversation?._id) return;
    const onNew = (msg) => {
      if (String(msg.conversationId) !== String(conversation._id)) return;
//---------------------------------------------------
      const idStr = String(msg._id || '');
      if (idStr && seenIdsRef.current.has(idStr)){
        seenIdsRef.current.delete(idStr);
        return;
      }
//--------------------------------------------------
      setMessages((prev) => /* (prev.some((m) => m._id === msg._id) ? prev :  */ mergeUniqueById([...prev, msg]));
      setTimeout(() => listRef.current?.scrollTo(0, listRef.current.scrollHeight), 0);
    };
    socket.on("message:new", onNew);
    return () => socket.off("message:new", onNew);
  }, [socket, conversation?._id]);

  // Removed polling; rely on socket updates after initial fetch

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      const participantIds = (conversation.participants || [])
      .map(part => (typeof part === 'object' ? part._id : part))
      .map(id => String(id));
      const peerId = participantIds.find(id => id !== String(currentUser._id));

      const res = await axios.post(API_ENDPOINTS.SEND_MESSAGE, {
        conversationId: conversation._id,
        senderId: currentUser._id,
        text: text.trim(),
        peerId,
      });

      //------------------------------------------------------
      const idStr = String(res.data?._id || '');
      if (idStr) seenIdsRef.current.add(idStr);
      //------------------------------------------------------
      setMessages((prev) => mergeUniqueById([...prev, res.data]));
      setText("");
      setTimeout(
        () => listRef.current?.scrollTo(0, listRef.current.scrollHeight),
        0
      );
    } catch (e) {
      console.error("Error enviando mensaje", e);
    }
  };

  
  return (
    <div className="chat-window">
      <div className="chat-header">
        <strong>{peer?.username || peer?.email || "Chat"}</strong>
        <button onClick={onClose} className="chat-header-close">✕</button>
      </div>

      <div ref={listRef} className="chat-messages" >

        {loading ? (
          <div className="loading-message">Cargando...</div>
        ) : messages.length === 0 ? (
          <div className="loading-message">No hay mensajes aún</div>
        ) : messages.map(m => {
          const isMine = m.senderId === currentUser._id || m.senderId?._id === currentUser._id || m.sender === currentUser._id;
          return (
            <div key={m._id} className={`message-content ${isMine ? 'mine' : ''}`}>
              <div className={`message-bubble ${isMine ? 'mine' : ''}`}>
                {m.text}
                <div className="message-time">
                  {new Date(m.createdAt).toLocaleTimeString()}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <form
        onSubmit={send}
        style={{
          padding: "0.6rem",
          borderTop: "1px solid #eee",
          display: "flex",
          gap: 8,
        }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe un mensaje..."
          style={{
            flex: 1,
            padding: "0.6rem 0.8rem",
            borderRadius: 8,
            border: "1px solid #ddd",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "0.6rem 0.9rem",
            borderRadius: 8,
            border: "none",
            color: "#fff",
            cursor: "pointer",
            background: "linear-gradient(90deg, #fb7202, #e82c0b)",
          }}
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
