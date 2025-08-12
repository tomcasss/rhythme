import { useEffect, useState } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../../config/api";

export default function ChatSidebar({ currentUser, onOpenConversation }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState(""); 
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!currentUser?._id) return;
    const fetchConvos = async () => {
      try {
        setLoading(true);
        const res = await axios.get(API_ENDPOINTS.GET_CONVERSATIONS(currentUser._id));
        setConversations(res.data || []);
      } catch (e) {
        console.error("Error cargando conversaciones", e);
      } finally {
        setLoading(false);
      }
    };
    fetchConvos();
  }, [currentUser]);

  const handleSearch = async (value) => {
    setQ(value);
    if (!value.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      setSearching(true);
      const res = await axios.get(API_ENDPOINTS.SEARCH_USERS(value.trim()));
      setSearchResults(res.data.users || []);
    } catch (e) {
      console.error("Error buscando usuarios", e);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const openWithUser = async (peer) => {
    try {
      const res = await axios.post(API_ENDPOINTS.OPEN_CONVERSATION, {
        userId: currentUser._id,
        peerId: peer._id,
      });
      const convo = res.data;
      setConversations((prev) => {
        if (prev.find((c) => c._id === convo._id)) return prev;
        return [convo, ...prev];
      });
      onOpenConversation(convo);
      setQ("");
      setSearchResults([]);
    } catch (e) {
      console.error("Error abriendo conversación", e);
    }
  };

  return (
    <aside style={{
      borderRight: "1px solid #eee",
      padding: "1rem",
      minWidth: 280,
      maxWidth: 320,
      background: "#fff",
      borderRadius: 8,
      height: "calc(100vh - 120px)",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      gap: "0.75rem"
    }}>
      <h3 style={{ margin: 0 }}>Mensajes</h3>

      <input
        value={q}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Buscar usuario..."
        style={{ padding: "0.6rem 0.8rem", borderRadius: 8, border: "1px solid #ddd", background: "#fff", color: "#222", outline: "none"}}
      />

      {!!q && (
        <div style={{ border: "1px solid #eee", borderRadius: 8, maxHeight: 220, overflowY: "auto" }}>
          {searching ? (
            <div style={{ padding: "0.75rem" }}>Buscando...</div>
          ) : searchResults.length === 0 ? (
            <div style={{ padding: "0.75rem", color: "#777" }}>Sin resultados</div>
          ) : searchResults.map(u => (
            <div
              key={u._id}
              onClick={() => openWithUser(u)}
              style={{ padding: "0.6rem 0.8rem", borderBottom: "1px solid #f5f5f5", cursor: "pointer" }}
            >
              {u.username || u.email}
            </div>
          ))}
        </div>
      )}

      <div style={{ fontWeight: 600, marginTop: "0.25rem" }}>Conversaciones</div>
      <div style={{ flex: 1, overflowY: "auto", border: "1px solid #eee", borderRadius: 8 }}>
        {loading ? (
          <div style={{ padding: "0.75rem" }}>Cargando...</div>
        ) : conversations.length === 0 ? (
          <div style={{ padding: "0.75rem", color: "#777" }}>No tienes conversaciones</div>
        ) : conversations.map(c => {
          const peer = c.participants.find(p => p._id !== currentUser._id);
          return (
            <div
              key={c._id}
              onClick={() => onOpenConversation(c)}
              style={{ padding: "0.75rem 0.9rem", borderBottom: "1px solid #f5f5f5", cursor: "pointer" }}
            >
              <div style={{ fontWeight: 600 }}>{peer?.username || peer?.email || "Usuario"}</div>
              {c.lastMessage && (
                <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
                  {c.lastMessage.sender === currentUser._id ? "Tú: " : ""}{c.lastMessage.text}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
