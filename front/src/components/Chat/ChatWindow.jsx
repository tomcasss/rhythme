import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../../config/api";

export default function ChatWindow({ currentUser, conversation, onClose }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const listRef = useRef(null);

  const peer = conversation?.participants?.find(p => p._id !== currentUser._id);

  useEffect(() => {
    if (!conversation?._id) return;
    const load = async () => {
      try {
        setLoading(true);
        const res = await axios.get(API_ENDPOINTS.GET_MESSAGES(conversation._id));
        setMessages(res.data || []);
      } catch (e) {
        console.error("Error cargando mensajes", e);
      } finally {
        setLoading(false);
        setTimeout(() => listRef.current?.scrollTo(0, listRef.current.scrollHeight), 0);
      }
    };
    load();
  }, [conversation]);

  useEffect(() => {
    if (!conversation?._id) return;
    const id = setInterval(async () => {
      try {
        const res = await axios.get(API_ENDPOINTS.GET_MESSAGES(conversation._id));
        setMessages(res.data || []);
      } catch {console.error("Error");}
    }, 5000);
    return () => clearInterval(id);
  }, [conversation]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      const res = await axios.post(API_ENDPOINTS.SEND_MESSAGE, {
        conversationId: conversation._id,
        sender: currentUser._id,
        text: text.trim()
      });
      setMessages(prev => [...prev, res.data]);
      setText("");
      setTimeout(() => listRef.current?.scrollTo(0, listRef.current.scrollHeight), 0);
    } catch (e) {
      console.error("Error enviando mensaje", e);
    }
  };

  return (
    <div style={{
      position: "fixed",
      right: 24,
      bottom: 24,
      width: 380,
      maxHeight: "70vh",
      background: "#fff",
      border: "1px solid #eee",
      borderRadius: 12,
      boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      zIndex: 2000
    }}>
      <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid #eee", display: "flex", alignItems: "center", gap: 8 }}>
        <strong>{peer?.username || peer?.email || "Chat"}</strong>
        <button onClick={onClose} style={{ marginLeft: "auto", border: "none", background: "transparent", cursor: "pointer", fontSize: 18, color: "#333"}}>✕</button>
      </div>

      <div ref={listRef} style={{ flex: 1, overflowY: "auto", padding: "0.75rem 1rem", background: "#fafafa" }}>
        {loading ? (
          <div style={{ color: "#777" }}>Cargando...</div>
        ) : messages.length === 0 ? (
          <div style={{ color: "#777" }}>No hay mensajes aún</div>
        ) : messages.map(m => {
          const isMine = m.sender === currentUser._id || m.sender?._id === currentUser._id;
          return (
            <div key={m._id} style={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start", marginBottom: 8 }}>
              <div style={{
                maxWidth: "80%",
                padding: "0.5rem 0.7rem",
                borderRadius: 10,
                background: isMine ? "linear-gradient(90deg, #fb7202, #e82c0b)" : "#fff",
                color: isMine ? "#fff" : "#333",
                border: isMine ? "none" : "1px solid #eee"
              }}>
                {m.text}
                <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>
                  {new Date(m.createdAt).toLocaleTimeString()}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={send} style={{ padding: "0.6rem", borderTop: "1px solid #eee", display: "flex", gap: 8 }}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Escribe un mensaje..."
          style={{ flex: 1, padding: "0.6rem 0.8rem", borderRadius: 8, border: "1px solid #ddd" }}
        />
        <button type="submit" style={{ padding: "0.6rem 0.9rem", borderRadius: 8, border: "none", color: "#fff", cursor: "pointer",
          background: "linear-gradient(90deg, #fb7202, #e82c0b)" }}>
          Enviar
        </button>
      </form>
    </div>
  );
}
