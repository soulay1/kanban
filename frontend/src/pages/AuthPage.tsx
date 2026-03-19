import { useState, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LangSwitcher } from '../components/LangSwitcher';

const BASE = 'http://localhost:8080/api/auth';

export function AuthPage() {
  const { login } = useAuth();
  const { tr } = useLanguage();
  const a = tr.auth;
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE}/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data === 'string' ? data : a.genericError);
        return;
      }
      login(data.token, data.username);
    } catch {
      setError(a.serverError);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(m => m === 'login' ? 'register' : 'login');
    setError(null);
    setUsername('');
    setPassword('');
  };

  return (
    <div className="auth-page">
      <div className="auth-lang">
        <LangSwitcher />
      </div>
      <div className="auth-card">
        <div className="auth-logo">K</div>
        <h1 className="auth-title">{a.title}</h1>
        <p className="auth-subtitle">
          {mode === 'login' ? a.loginSubtitle : a.registerSubtitle}
        </p>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setError(null); }}
          >
            {a.loginTab}
          </button>
          <button
            className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => { setMode('register'); setError(null); }}
          >
            {a.registerTab}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          <div className="auth-field">
            <label>{a.username}</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder={a.usernamePlaceholder}
              autoFocus
              autoComplete="username"
            />
          </div>

          <div className="auth-field">
            <label>{a.password}</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          <button
            type="submit"
            className="auth-submit"
            disabled={loading || !username.trim() || !password.trim()}
          >
            {loading ? a.loading : mode === 'login' ? a.loginBtn : a.registerBtn}
          </button>
        </form>

        <p className="auth-switch">
          {mode === 'login' ? a.noAccount : a.alreadyAccount}
          <button onClick={switchMode}>
            {mode === 'login' ? ` ${a.switchToRegister}` : ` ${a.switchToLogin}`}
          </button>
        </p>
      </div>
    </div>
  );
}
