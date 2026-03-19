import { useState, useEffect } from 'react';
import { Board } from '../types/kanban';
import { kanbanApi } from '../api/kanbanApi';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LangSwitcher } from '../components/LangSwitcher';
import { ProfileModal } from '../components/ProfileModal';
import './BoardsPage.css';

interface BoardsPageProps {
  onSelectBoard: (board: Board) => void;
}

export function BoardsPage({ onSelectBoard }: BoardsPageProps) {
  const { username, logout } = useAuth();
  const { tr } = useLanguage();
  const b = tr.boards;
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editBoard, setEditBoard] = useState<Board | null>(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [saving, setSaving] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

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
      setError(b.loadError);
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
    if (!confirm(b.deleteConfirm(board.name))) return;
    try {
      await kanbanApi.deleteBoard(board.id);
      setBoards((prev) => prev.filter((bd) => bd.id !== board.id));
    } catch {
      setError(b.deleteError);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!formName.trim()) return;
    setSaving(true);
    try {
      if (editBoard) {
        const updated = await kanbanApi.updateBoard(editBoard.id, formName.trim(), formDesc.trim());
        setBoards((prev) => prev.map((bd) => (bd.id === updated.id ? updated : bd)));
      } else {
        const created = await kanbanApi.createBoard(formName.trim(), formDesc.trim());
        setBoards((prev) => [created, ...prev]);
      }
      setShowForm(false);
    } catch {
      setError(b.saveError);
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

  return (
    <div className="boards-page">
      <header className="boards-header">
        <div className="boards-header__left">
          <div className="boards-logo">K</div>
          <div>
            <h1>Kanban</h1>
            <p>{b.workspace}</p>
          </div>
        </div>
        <div className="boards-header__right">
          <LangSwitcher />
          <div className="app__user">
            <span className="app__user-avatar" onClick={() => setShowProfile(true)} title={tr.app.profile}>{username?.[0]?.toUpperCase()}</span>
            <span className="app__username">{username}</span>
            <button className="app__logout" onClick={logout} title={tr.app.logout}>↩</button>
          </div>
        </div>
      </header>

      <main className="boards-main">
        <div className="boards-section">
          <div className="boards-section__header">
            <h2>{b.myBoards}</h2>
            <button className="btn btn--primary" onClick={openCreate}>
              {b.newBoard}
            </button>
          </div>

          {error && (
            <div className="app__error">
              {error}
              <button className="btn btn--ghost-sm" onClick={loadBoards}>{b.retry}</button>
            </div>
          )}

          {loading ? (
            <div className="app__loading">
              <div className="spinner" />
              <span>{b.loading}</span>
            </div>
          ) : boards.length === 0 ? (
            <div className="boards-empty">
              <div className="boards-empty__icon">📋</div>
              <h3>{b.emptyTitle}</h3>
              <p>{b.emptyDesc}</p>
              <button className="btn btn--primary" onClick={openCreate}>{b.createFirst}</button>
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
                      <span>{b.columns(board.columnCount)}</span>
                      <span>·</span>
                      <span>{b.cards(board.cardCount)}</span>
                    </div>
                    {board.createdAt && (
                      <div className="board-card__date">
                        {b.createdAt} {new Date(board.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
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

      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2>{editBoard ? b.editTitle : b.newTitle}</h2>
              <button className="modal__close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <form onSubmit={handleSave} className="modal__body">
              <div className="form-group">
                <label>{b.boardName}</label>
                <input
                  className="input"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder={b.boardNamePlaceholder}
                  autoFocus
                  required
                />
              </div>
              <div className="form-group">
                <label>{b.description}</label>
                <textarea
                  className="input"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder={b.descriptionPlaceholder}
                  rows={3}
                />
              </div>
              <div className="modal__footer">
                <button type="button" className="btn btn--ghost" onClick={() => setShowForm(false)}>
                  {b.cancel}
                </button>
                <button type="submit" className="btn btn--primary" disabled={saving}>
                  {saving ? b.saving : editBoard ? b.save : b.create}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
