export function newMessageTemplate({ recipient, sender, text, link}){
    const subject = `Nuevo mensaje de ${sender?.username || 'alguien'}`;
    const preview = text?.slice(0, 120) || '';
    const html = `
    <div style="font-family:sans-serif">
      <h2>Tienes un mensaje nuevo</h2>
      <p><strong>${sender?.username || 'Un usuario'}</strong> te ha enviado:</p>
      <blockquote style="border-left:4px solid #ddd;padding-left:10px;color:#444">${escapeHtml(preview)}</blockquote>
      <p>Revisa la conversacion en tu bandeja de entrada.</p>
    </div>
    `;
    const textBody = `Nuevo mensaje de ${sender?.username || 'un usuario'}: ${preview}\n\nAbrir: ${link}`;
    return {subject, html, text: textBody};
}

export function postLikedTemplate({ recipient, actor, post, link }) {
  const subject = `${actor?.username || 'Alguien'} le dio like a tu publicación`;
  const preview = (post?.desc || '').slice(0, 120);
  const html = `
    <div style="font-family:sans-serif">
      <h2>¡Nuevo like! 👍🏻</h2>
      <p><strong>${actor?.username || 'Un usuario'}</strong> le dio like a tu publicación.</p>
      ${preview ? `<blockquote style="border-left:4px solid #ddd;padding-left:10px;color:#444">${escapeHtml(preview)}</blockquote>` : ''}
      <p><a href="${link}" style="background:#4f46e5;color:#fff;padding:10px 14px;border-radius:6px;text-decoration:none">Ver publicación</a></p>
    </div>
  `;
  const textBody = `${actor?.username || 'Alguien'} le dio like a tu publicación.\n${preview ? `\n${preview}\n` : ''}\nVer: ${link}`;
  return { subject, html, text: textBody };
}

export function postCommentTemplate({ recipient, actor, post, commentText, link }) {
  const subject = `${actor?.username || 'Alguien'} comentó tu publicación`;
  const preview = commentText?.slice(0, 140) || '';
  const html = `
    <div style="font-family:sans-serif">
      <h2>Nuevo comentario 💬</h2>
      <p><strong>${actor?.username || 'Un usuario'}</strong> comentó tu publicación:</p>
      <blockquote style="border-left:4px solid #ddd;padding-left:10px;color:#444">${escapeHtml(preview)}</blockquote>
      <p><a href="${link}" style="background:#4f46e5;color:#fff;padding:10px 14px;border-radius:6px;text-decoration:none">Ver comentario</a></p>
    </div>
  `;
  const textBody = `${actor?.username || 'Alguien'} comentó tu publicación: ${preview}\n\nVer: ${link}`;
  return { subject, html, text: textBody };
}

function escapeHtml(str = '') {
  return str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}