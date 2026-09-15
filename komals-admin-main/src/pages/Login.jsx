import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, setToken, setUser } from '../lib/api.js';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { username, password });
      setToken(res.data.token);
      setUser({ username: res.data.username, role: res.data.role });
      if (res.data.role === 'PRODUCT_MANAGER') {
        navigate('/products', { replace: true });
      } else if (res.data.role === 'WHATSAPP_MANAGER') {
        navigate('/whatsapp/inbox', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid username or password';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)' }}>
      <form onSubmit={handleSubmit} className="card" style={{ width: 340, padding: 32 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              fontWeight: 700,
              boxShadow: 'var(--shadow-md)',
            }}
          >
            K
          </div>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: 19, margin: 0 }}>Komal's Sweet Palace Admin</h1>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--on-surface-variant)' }}>Sign in to manage your store</p>
          </div>
        </div>
        <div className="field">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            required
          />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && (
          <div
            style={{
              background: 'var(--error-container)',
              color: 'var(--on-error-container)',
              borderRadius: 10,
              padding: '8px 12px',
              fontSize: 13,
              marginBottom: 14,
            }}
          >
            {error}
          </div>
        )}
        <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '10px 18px' }}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
