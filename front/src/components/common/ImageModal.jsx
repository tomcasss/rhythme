// src/components/common/ImageModal.jsx
import React, { useEffect } from 'react';
import './ImageModal.css';

export default function ImageModal({ src, alt = 'Imagen', onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!src) return null;

  return (
    <div className="img-modal-backdrop" onClick={onClose}>
      <div className="img-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="img-modal-close" onClick={onClose} aria-label="Cerrar">×</button>
        <img src={src} alt={alt} className="img-modal-full" />
      </div>
    </div>
  );
}
