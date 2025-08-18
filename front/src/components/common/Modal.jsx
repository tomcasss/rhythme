import React, { useEffect, useRef } from 'react';
import './Modal.css';

export default function Modal({ isOpen, title, onClose, children, footer }) {
  const firstFocusRef = useRef(null);

  useEffect(() => {
    if (isOpen && firstFocusRef.current) {
      firstFocusRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Cerrar">×</button>
        </div>
        <p>Ingresa tu correo electrónico para recuperar tu contraseña</p>
        <div>{React.cloneElement(children, { firstFocusRef })}</div>
        {footer ? <div className="modal-footer">{footer}</div> : null}
      </div>
    </div>
  );
}
