import { useMemo, useState } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';

export default function PasswordReset({
  uid,
  token,
  onSuccess,
  onCancel,
  asModal = false,
}) {
  const params = (typeof window !== 'undefined')
  ? new URLSearchParams(window.location.search)
  : new URLSearchParams();

  const uidFromSearch = params.get('uid');
  const tokenFromSearch = params.get('token');

  const finalUid = uid || uidFromSearch;
  const finalToken = token || tokenFromSearch;

  const isConfirm = useMemo(() => Boolean(finalUid && finalToken), [finalUid, finalToken]);

  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const requestReset = async (e) => {
    e?.preventDefault();
    setLoading(true); setErr(''); setMsg('');
    try {
      await axios.post(API_ENDPOINTS.REQUEST_PASSWORD_RESET, { email });

      setMsg('Si el correo existe, te enviaremos instrucciones.');
      onSuccess?.({ type: 'request' });
    } catch {
      setErr('Error solicitando restablecimiento. Intenta más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const confirmReset = async (e) => {
    e?.preventDefault();
    setLoading(true); setErr(''); setMsg('');
    try {
      await axios.post(API_ENDPOINTS.CONFIRM_PASSWORD_RESET, { 
        uid: finalUid, 
        token: decodeURIComponent(finalToken), 
        newPassword: pass 
      });
      setMsg('Contraseña actualizada. Ahora puedes iniciar sesión.');
      onSuccess?.({ type: 'confirm' });
    } catch {
      setErr('Token inválido o expirado.');
    } finally {
      setLoading(false);
    }
  };

  const passwordsMatch = pass === confirmPass;

  const content = (
    <>
      {!isConfirm ? (
        <form onSubmit={requestReset}>
          <input type='email'
            placeholder='Correo'
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            disabled={loading}
            style={{ width: '100%', padding: 10, margin: '8px 0' }} />
          <div style={{ display: 'flex', gap: 8 }}>
            {onCancel && (<button type='button' onClick={onCancel} disabled={loading}>Cancelar</button>)}
            <button type='submit' disabled={loading}>{loading ? 'Enviando...' : 'Enviar'}</button>
          </div>
        </form>
      ) : (
        <form onSubmit={confirmReset}>
          <input type="password"
            placeholder='Nueva contraseña'
            value={pass}
            onChange={e => setPass(e.target.value)}
            required
            disabled={loading}
            style={{ width: '100%', padding: 10, margin: '8px 0' }} />
          <input type="password"
            placeholder='Confirmar nueva contraseña'
            value={confirmPass}
            onChange={e => setConfirmPass(e.target.value)}
            required
            disabled={loading}
            style={{ width: '100%', padding: 10, margin: '8px 0' }} />
            {!passwordsMatch && confirmPass && (
              <p style={{ color: '#d00', marginTop: 5 }}>Las contraseñas no coinciden.</p>
            )}
          <div style={{ display: 'flex', gap: 8 }}>
            {onCancel && (
              <button type='button' onClick={onCancel} disabled={loading}>
                Cancelar
              </button>
            )}
            <button type='submit' disabled={loading || !passwordsMatch}>
              {loading ? 'Actualizando...' : 'Actualizar contraseña'}
            </button>
          </div>
        </form>
      )}
      {msg && <p style={{ color: 'green', marginTop: 10 }}>{msg}</p>}
      {err && <p style={{ color: '#d00', marginTop: 10 }}>{err}</p>}
    </>
  );
  if (asModal) return content;

  return (
    <div style={{ maxWidth: 420, margin: '40px auto', fontFamily: 'system-ui, sans-serif' }}>
      <h2>Restablecer contraseña</h2>
      {!isConfirm ? (
        <form onSubmit={requestReset}>
          <input type="email" placeholder="Correo" value={email} onChange={e => setEmail(e.target.value)} required disabled={loading} style={{ width: '100%', padding: 10, margin: '8px 0' }} />
          <button type="submit" disabled={loading} style={{ padding: '10px 14px' }}>
            {loading ? 'Enviando...' : 'Enviar instrucciones'}
          </button>
        </form>
      ) : (
        <form onSubmit={confirmReset}>
          <input type="password" placeholder="Nueva contraseña" value={pass} onChange={e => setPass(e.target.value)} required disabled={loading} style={{ width: '100%', padding: 10, margin: '8px 0' }} />
          <button type="submit" disabled={loading} style={{ padding: '10px 14px' }}>
            {loading ? 'Actualizando...' : 'Actualizar contraseña'}
          </button>
        </form>
      )}
      {msg && <p style={{ color: 'green', marginTop: 10 }}>{msg}</p>}
      {err && <p style={{ color: '#d00', marginTop: 10 }}>{err}</p>}
    </div>
  );
}