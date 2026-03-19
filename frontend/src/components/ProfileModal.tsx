import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { kanbanApi } from '../api/kanbanApi';

interface Props {
  onClose: () => void;
}

export function ProfileModal({ onClose }: Props) {
  const { username, updateUser } = useAuth();
  const { tr } = useLanguage();
  const p = tr.profile;

  const [currentPassword, setCurrentPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      setError(p.passwordMismatch);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const result = await kanbanApi.updateProfile(
        currentPassword,
        newUsername.trim() || undefined,
        newPassword || undefined,
      );
      updateUser(result.token, result.username);
      setSuccess(true);
      setTimeout(onClose, 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--small" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2>{p.title}</h2>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal__form">
          <div className="modal__field profile-current-user">
            <span className="profile-avatar">{username?.[0]?.toUpperCase()}</span>
            <span className="profile-username">{username}</span>
          </div>

          {error && <div className="auth-error">{error}</div>}
          {success && <div className="profile-success">{p.success}</div>}

          <div className="modal__field">
            <label>{p.currentPassword}</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder={p.currentPasswordPlaceholder}
              autoFocus
              required
            />
          </div>
          <div className="modal__field">
            <label>{p.newUsername}</label>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder={p.newUsernamePlaceholder}
            />
          </div>
          <div className="modal__field">
            <label>{p.newPassword}</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={p.newPasswordPlaceholder}
            />
          </div>
          {newPassword && (
            <div className="modal__field">
              <label>{p.confirmPassword}</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={p.confirmPasswordPlaceholder}
              />
            </div>
          )}
          <div className="modal__actions">
            <button type="button" className="btn btn--ghost" onClick={onClose}>{p.cancel}</button>
            <button type="submit" className="btn btn--primary" disabled={saving || !currentPassword}>
              {saving ? p.saving : p.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
