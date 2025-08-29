'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      router.push('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo">🗞️</div>
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">Join to save and follow stories.</p>
        </div>

        {error && <p className="auth-error" role="alert">{error}</p>}

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="input-group">
            <span className="input-label">Username</span>
            <input
              name="username"
              placeholder="Your name"
              value={form.username}
              onChange={handleChange}
              required
              className="input"
              autoComplete="username"
            />
          </label>

          <label className="input-group">
            <span className="input-label">Email</span>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
              className="input"
              autoComplete="email"
            />
          </label>

          <label className="input-group">
            <span className="input-label">Password</span>
            <div className="input-with-action">
              <input
                name="password"
                type={showPw ? 'text' : 'password'}
                placeholder="Create a strong password"
                value={form.password}
                onChange={handleChange}
                required
                className="input"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="input-action"
                onClick={() => setShowPw(s => !s)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
          </label>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating…' : 'Register'}
          </button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <div className="auth-footer">
          <p>Already have an account? <a href="/login" className="auth-link">Login</a></p>
          <a href="/" className="auth-link subtle">← Back to home</a>
        </div>
      </div>
    </div>
  );
}
