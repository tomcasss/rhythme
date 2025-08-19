import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../AdminPanel.css";
import Swal from "sweetalert2/dist/sweetalert2.all.js";
import { API_ENDPOINTS } from "../config/api";

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [showUsers, setShowUsers] = useState(false);
  const [showPosts, setShowPosts] = useState(false);
  const [showUserOptions, setShowUserOptions] = useState(null);
  const [showPostOptions, setShowPostOptions] = useState(null);
  const [reports, setReports] = useState([]);
  const [showReports, setShowReports] = useState(false);
  const [reportsError, setReportsError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
  const usersRes = await axios.get("http://localhost:5000/api/v1/users");
  const postsRes = await axios.get("http://localhost:5000/api/v1/posts");
  // Endpoint espera isAdmin en el body (se implementó como verificación simple del lado servidor)
  let reportsRes = await axios.get(API_ENDPOINTS.LIST_REPORTS('open'), { params: { isAdmin: true } }).catch(err => { console.warn('Fetch open reports failed', err?.response?.status); return { data: { reports: [], _err: err } }; });
  if ((reportsRes.data.reports || []).length === 0) {
    const allRes = await axios.get(API_ENDPOINTS.LIST_REPORTS(undefined), { params: { isAdmin: true } }).catch(err => ({ data: { reports: [], _err: err } }));
    if ((allRes.data.reports || []).length > 0) {
      reportsRes = allRes;
    } else if (reportsRes.data._err) {
      setReportsError(reportsRes.data._err?.response?.data?.message || 'No se pudieron obtener reportes');
    }
  }
        setUsers(usersRes.data);
        setPosts(postsRes.data);
  setReports(reportsRes.data.reports || []);
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

  const refreshReports = async () => {
    try {
      setReportsError('');
      let reportsRes = await axios.get(API_ENDPOINTS.LIST_REPORTS('open'), { params: { isAdmin: true } });
      if ((reportsRes.data.reports || []).length === 0) {
        const allRes = await axios.get(API_ENDPOINTS.LIST_REPORTS(undefined), { params: { isAdmin: true } });
        if ((allRes.data.reports || []).length > 0) reportsRes = allRes;
      }
      setReports(reportsRes.data.reports || []);
    } catch (e) {
      setReports([]);
      setReportsError(e?.response?.data?.message || 'Error obteniendo reportes');
    }
  };

  const handleMarkReviewed = async (reportId, adminResponseMessage) => {
    try {
      await axios.patch(API_ENDPOINTS.REVIEW_REPORT(reportId), { isAdmin: true, adminResponseMessage });
      Swal.fire('Revisado', 'Reporte marcado como revisado', 'success');
      setReports(r => r.filter(rep => rep._id !== reportId));
    } catch {
      Swal.fire('Error', 'No se pudo actualizar el reporte', 'error');
    }
  };

  const handleShowReportDetail = (rep) => {
    const sanitize = (v='') => String(v).replace(/[&<>]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[ch]));
    const reporter = rep.reporterId || {};
    const target = rep.targetUserId || {};
    const reporterName = typeof reporter === 'object' ? (reporter.username || reporter.email || reporter._id) : reporter;
    const targetName = typeof target === 'object' ? (target.username || target.email || target._id) : target;
    const reporterEmail = typeof reporter === 'object' ? reporter.email : '';
    const targetEmail = typeof target === 'object' ? target.email : '';
    const hasPost = !!rep.targetPostId;
    Swal.fire({
      title: 'Detalle del Reporte',
      width: 700,
      html: `<div style="text-align:left;max-height:55vh;overflow:auto">`+
        `<p><strong>ID reporte:</strong> ${sanitize(rep._id)}</p>`+
        (hasPost ? `<p><strong>Post ID:</strong> ${sanitize(rep.targetPostId?._id || rep.targetPostId)}</p>`:'')+
        `<p><strong>Reportado:</strong> ${sanitize(targetName)}${targetEmail?` <small style='color:#666'>(${sanitize(targetEmail)})</small>`:''}</p>`+
        `<p><strong>Reportante:</strong> ${sanitize(reporterName)}${reporterEmail?` <small style='color:#666'>(${sanitize(reporterEmail)})</small>`:''}</p>`+
        `<p><strong>Motivo:</strong> ${sanitize(rep.reason)}</p>`+
        (rep.description ? `<p><strong>Descripción:</strong><br>${sanitize(rep.description)}</p>` : '')+
        (hasPost && rep.targetPostId?.desc ? `<p><strong>Contenido post:</strong><br>${sanitize(rep.targetPostId.desc)}</p>`:'')+
        `<hr/>`+
        `<label style='font-weight:600;display:block;margin:6px 0 4px'>Respuesta al reportante (opcional)</label>`+
        `<textarea id='admin-response' style='width:100%;min-height:90px;padding:6px;border:1px solid #ccc;border-radius:4px;resize:vertical' placeholder='Mensaje que verá el usuario reportante'></textarea>`+
        `</div>`,
      showCancelButton: true,
      cancelButtonText: 'Cerrar',
      confirmButtonText: 'Marcar revisado',
      confirmButtonColor: '#27ae60',
      didOpen: () => {
        if (hasPost) {
          const btnDel = document.createElement('button');
          btnDel.textContent = 'Eliminar Post';
          btnDel.className = 'swal2-deny swal2-styled';
          btnDel.onclick = async () => {
            try {
              const confirm = await Swal.fire({ title: 'Eliminar post', text: '¿Seguro que deseas eliminar este post?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar' });
              if (!confirm.isConfirmed) return;
              await axios.delete(API_ENDPOINTS.DELETE_POST(rep.targetPostId._id || rep.targetPostId, target._id), { data: { isAdmin: true } });
              Swal.fire('Eliminado','Post eliminado','success');
            } catch(e){
              console.error('Delete post failed', e);
              Swal.fire('Error','No se pudo eliminar','error');
            }
          };
          const actions = document.querySelector('.swal2-actions');
          if (actions) actions.prepend(btnDel);
        }
      }
    }).then(async r => {
      if (r.isConfirmed) {
        const message = document.getElementById('admin-response')?.value?.trim();
        await handleMarkReviewed(rep._id, message);
      }
    });
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
                  <p className="card-title">
                    <strong>Username:</strong> {u.username || "username no disponible"}
                  </p>
                  <button
                    className="options-btn"
                    onClick={() => handleUserOptions(u._id)}
                  >
                    ⋮
                  </button>
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

      <section>
        <h2 onClick={() => { setShowReports(!showReports); if(!showReports) refreshReports(); }} className="collapsible-title">
          Reportes {showReports ? '🔍' : '🗂️'}
        </h2>
    {showReports && (
          <div className="admin-list">
      {reportsError && <p style={{color:'#e74c3c'}}>{reportsError}</p>}
      {!reportsError && reports.length === 0 && <p>No hay reportes.</p>}
            {reports.map(rep => (
              <div className="admin-card" key={rep._id}>
                <p><strong>Reportado:</strong> {rep.targetUserId?.username || rep.targetUserId}</p>
                <p><strong>Reportante:</strong> {rep.reporterId?.username || rep.reporterId}</p>
                <p><strong>Motivo:</strong> {rep.reason}</p>
                <div style={{ display:'flex', gap:'0.5rem' }}>
                  <button className="options-btn-report" onClick={() => handleShowReportDetail(rep)}>Ver</button>
                  <button className="options-btn-report" onClick={() => handleMarkReviewed(rep._id)}>Revisado</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
