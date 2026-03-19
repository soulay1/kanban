import { useState, useEffect } from 'react';
import { Board } from '../types/kanban';
import { kanbanApi } from '../api/kanbanApi';
import { useAuth } from '../context/AuthContext';
import './BoardsPage.css';

interface BoardsPageProps {
  onSelectBoard: (board: Board) => void;
}

export function BoardsPage({ onSelectBoard }: BoardsPageProps) {
  const { username, logout } = useAuth();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editBoard, setEditBoard] = useState<Board | null>(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadBoards();
  }, []);

  async function loadBoards() {
    try {
      setLoading(true);
      const data = await kanbanApi.getBoards();
      setBoards(data);
      setError(null);
    } catch {
      setError('Impossible de charger les boards.');
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditBoard(null);
    setFormName('');
    setFormDesc('');
    setShowForm(true);
  }

  function openEdit(board: Board, e: React.MouseEvent) {
    e.stopPropagation();
    setEditBoard(board);
    setFormName(board.name);
    setFormDesc(board.description || '');
    setShowForm(true);
  }

  async function handleDelete(board: Board, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm(`Supprimer le board "${board.name}" et tout son contenu ?`)) return;
    try {
      await kanbanApi.deleteBoard(board.id);
      setBoards((prev) => prev.filter((b) => b.id !== board.id));
    } catch {
      setError('Erreur lors de la suppression.');
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!formName.trim()) return;
    setSaving(true);
    try {
      if (editBoard) {
        const updated = await kanbanApi.updateBoard(editBoard.id, formName.trim(), formDesc.trim());
        setBoards((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      } else {
        const created = await kanbanApi.createBoard(formName.trim(), formDesc.trim());
        setBoards((prev) => [created, ...prev]);
      }
      setShowForm(false);
    } catch {
      setError('Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  }

  const boardColors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
    '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6',
  ];

  function getBoardColor(id: number) {
    return boardColors[id % boardColors.length];
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  return (
    <div className="boards-page">
      <header className="boards-header">
        <div className="boards-header__left">
          <div className="boards-logo">K</div>
          <div>
            <h1>Kanban</h1>
            <p>Espace de travail</p>
          </div>
        </div>
        <div className="boards-header__right">
          <div className="app__user">
            <span className="app__user-avatar">{username?.[0]?.toUpperCase()}</span>
            <span className="app__username">{username}</span>
            <button className="app__logout" onClick={logout} title="Se déconnecter">↩</button>
          </div>
        </div>
      </header>

      <main className="boards-main">
        <div className="boards-section">
          <div className="boards-section__header">
            <h2>Mes boards</h2>
            <button className="btn btn--primary" onClick={openCreate}>
              + Nouveau board
            </button>
          </div>

          {error && (
            <div className="app__error">
              {error}
              <button className="btn btn--ghost-sm" onClick={loadBoards}>Réessayer</button>
            </div>
          )}

          {loading ? (
            <div className="app__loading">
              <div className="spinner" />
              <span>Chargement...</span>
            </div>
          ) : boards.length === 0 ? (
            <div className="boards-empty">
              <div className="boards-empty__icon">📋</div>
              <h3>Aucun board pour l'instant</h3>
              <p>Créez votre premier board pour organiser vos tâches</p>
              <button className="btn btn--primary" onClick={openCreate}>+ Créer un board</button>
            </div>
          ) : (
            <div className="boards-grid">
              {boards.map((board) => (
                <div
                  key={board.id}
                  className="board-card"
                  onClick={() => onSelectBoard(board)}
                  style={{ '--board-color': getBoardColor(board.id) } as React.CSSProperties}
                >
                  <div className="board-card__banner" />
                  <div className="board-card__body">
                    <h3 className="board-card__title">{board.name}</h3>
                    {board.description && (
                      <p className="board-card__desc">{board.description}</p>
                    )}
                    <div className="board-card__meta">
                      <span>{board.columnCount} colonne{board.columnCount !== 1 ? 's' : ''}</span>
                      <span>·</span>
                      <span>{board.cardCount} carte{board.cardCount !== 1 ? 's' : ''}</span>
                    </div>
                    {board.createdAt && (
                      <div className="board-card__date">Créé le {formatDate(board.createdAt)}</div>
                    )}
                  </div>
                  <div className="board-card__actions">
                    <button
                      className="board-card__action-btn"
                      onClick={(e) => openEdit(board, e)}
                      title="Modifier"
                    >✏️</button>
                    <button
                      className="board-card__action-btn board-card__action-btn--danger"
                      onClick={(e) => handleDelete(board, e)}
                      title="Supprimer"
                    >🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2>{editBoard ? 'Modifier le board' : 'Nouveau board'}</h2>
              <button className="modal__close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <form onSubmit={handleSave} className="modal__body">
              <div className="form-group">
                <label>Nom du board *</label>
                <input
                  className="input"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ex: Projet Alpha, Sprint Q1..."
                  autoFocus
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  className="input"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Description optionnelle..."
                  rows={3}
                />
              </div>
              <div className="modal__footer">
                <button type="button" className="btn btn--ghost" onClick={() => setShowForm(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn--primary" disabled={saving}>
                  {saving ? 'Enregistrement...' : editBoard ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
