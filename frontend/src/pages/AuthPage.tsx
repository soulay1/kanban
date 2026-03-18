import { useState, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';

const BASE = 'http://localhost:8080/api/auth';

export function AuthPage() {
  const { login } = useAuth();
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
        setError(typeof data === 'string' ? data : 'Une erreur est survenue.');
        return;
      }
      login(data.token, data.username);
    } catch {
      setError('Impossible de se connecter au serveur.');
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
      <div className="auth-card">
        <div className="auth-logo">K</div>
        <h1 className="auth-title">Kanban Board</h1>
        <p className="auth-subtitle">
          {mode === 'login' ? 'Connectez-vous à votre compte' : 'Créez votre compte'}
        </p>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setError(null); }}
          >
            Connexion
          </button>
          <button
            className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => { setMode('register'); setError(null); }}
          >
            Inscription
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          <div className="auth-field">
            <label>Nom d'utilisateur</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Entrez votre identifiant"
              autoFocus
              autoComplete="username"
            />
          </div>

          <div className="auth-field">
            <label>Mot de passe</label>
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
            {loading ? 'Chargement...' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
          </button>
        </form>

        <p className="auth-switch">
          {mode === 'login' ? "Pas encore de compte ?" : 'Déjà un compte ?'}
          <button onClick={switchMode}>
            {mode === 'login' ? ' Inscription' : ' Connexion'}
          </button>
        </p>
      </div>
    </div>
  );
}
