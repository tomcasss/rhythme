import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../AdminPanel.css";
import Swal from "sweetalert2";

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [showUsers, setShowUsers] = useState(false);
  const [showPosts, setShowPosts] = useState(false);
  const [showUserOptions, setShowUserOptions] = useState(null);
  const [showPostOptions, setShowPostOptions] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersRes = await axios.get("http://localhost:5000/api/v1/users");
        const postsRes = await axios.get("http://localhost:5000/api/v1/posts");
        setUsers(usersRes.data);
        setPosts(postsRes.data);
      } catch (err) {
        console.error("Error cargando datos del panel:", err);
      }
    };
    fetchData();
  }, []);

  const handleUserOptions = (id) => {
    setShowUserOptions(showUserOptions === id ? null : id);
  };

  const handlePostOptions = (id) => {
    setShowPostOptions(showPostOptions === id ? null : id);
  };

  const handleDeleteUser = async (id) => {
    try {
      const confirm = window.confirm(
        "¿Seguro que deseas eliminar este usuario?"
      );
      if (!confirm) return;

      await axios.delete(`http://localhost:5000/api/v1/users/${id}`, {
        data: {
          userId: id,
          isAdmin: true,
        },
      });

      setUsers((prev) => prev.filter((u) => u._id !== id));
      Swal.fire({
        icon: "success",
        title: "Usuario eliminado",
        text: "El usuario ha sido eliminado correctamente.",
      });
    } catch (err) {
      console.error("Error eliminando usuario:", err);
      Swal.fire({
        icon: "error",
        title: "Error al eliminar usuario",
        text: "Intenta de nuevo más tarde.",
      });
    }
  };

  const handleNotifyUser = (id) => {
    console.log("Notificar usuario", id);
  };

  const handleDeletePost = async (postId, userId) => {
    try {
      const confirm = window.confirm("¿Seguro que deseas eliminar este post?");
      if (!confirm) return;

      await axios.delete(
        `http://localhost:5000/api/v1/posts/delete-post/${postId}/${userId}`
      );
      setPosts((prev) => prev.filter((p) => p._id !== postId));
      Swal.fire({
        icon: "success",
        title: "Post eliminado",
        text: "El post ha sido eliminado correctamente.",
      });
    } catch (err) {
      console.error("Error eliminando post:", err);
      Swal.fire({
        icon: "error",
        title: "Error al eliminar post",
        text: "Intenta de nuevo más tarde.",
      });
    }
  };

const handleNotifyPost = async (postId) => {
  try {
    const post = posts.find((p) => p._id === postId);
    if (!post || !post.userId?._id) {
      Swal.fire({
        icon: "error",
        title: "Error al notificar usuario",
        text: "No se encontró el usuario del post.",
      });
      return;
    }

    await axios.post("http://localhost:5000/api/v1/notifications/notify",  {
      userId: post.userId._id,
      postId: postId,
      message: "Tu post ha sido reportado por infringir las normas.",
    });
    Swal.fire({
      icon: "success",
      title: "Notificación enviada",
      text: "La notificación ha sido enviada al usuario.",
    });
  } catch (err) {
    console.error("Error notificando al usuario:", err);
    Swal.fire({
      icon: "error",
      title: "Error al notificar usuario",
      text: "Intenta de nuevo más tarde.",
    });
  }
};

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="admin-container">
      <button onClick={handleLogout} className="options-btn">
        Salir de Administración
      </button>
      <h1 className="admin-title">Panel de Administración</h1>

      <section>
        <h2
          onClick={() => setShowUsers(!showUsers)}
          className="collapsible-title"
        >
          Usuarios {showUsers ? "😲" : "🫣"}
        </h2>
        {showUsers && (
          <div className="admin-list">
            {users.map((u) => (
              <div className="admin-card" key={u._id}>
                <div className="card-header">
                  <button
                    className="options-btn"
                    onClick={() => handleUserOptions(u._id)}
                  >
                    ⋮
                  </button>
                  <p>
                    <strong>Username:</strong> {u.username}
                  </p>
                </div>
                <p>
                  <strong>Email:</strong> {u.email}
                </p>

                {showUserOptions === u._id && (
                  <div className="options-menu">
                    <button onClick={() => handleDeleteUser(u._id)}>
                      Eliminar
                    </button>
                    <button onClick={() => handleNotifyUser(u._id)}>
                      Notificar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2
          onClick={() => setShowPosts(!showPosts)}
          className="collapsible-title"
        >
          Posts {showPosts ? "😲" : "🫣"}
        </h2>
        {showPosts && (
          <div className="admin-list">
            {posts.map((p) => (
              <div className="admin-card" key={p._id}>
                <div className="card-header">
                  <button
                    className="options-btn"
                    onClick={() => handlePostOptions(p._id)}
                  >
                    ⋮
                  </button>
                  <p>
                    <strong>Autor:</strong> {p.userId?.username} (
                    {p.userId?.email})
                  </p>
                </div>
                <p>
                  <strong>Descripción:</strong> {p.desc}
                </p>
                {p.img && <img src={p.img} alt="Post" className="admin-img" />}
                <p>
                  <strong>Likes:</strong> {p.likes?.length || 0}
                </p>

                {showPostOptions === p._id && (
                  <div className="options-menu">
                    <button
                      onClick={() => handleDeletePost(p._id, p.userId?._id)}
                    >
                      Eliminar
                    </button>
                    <button onClick={() => handleNotifyPost(p._id)}>
                      Notificar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
