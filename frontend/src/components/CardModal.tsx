import { useState, useEffect } from 'react';
import { Card, Priority } from '../types/kanban';
import { kanbanApi } from '../api/kanbanApi';

interface Props {
  card?: Card | null;
  columnId: number;
  onSave: (data: Partial<Card>) => void;
  onClose: () => void;
}

const PRIORITIES: { value: Priority; label: string }[] = [
  { value: 'LOW', label: 'Faible' },
  { value: 'MEDIUM', label: 'Moyen' },
  { value: 'HIGH', label: 'Élevé' },
  { value: 'URGENT', label: 'Urgent' },
];

export function CardModal({ card, onSave, onClose }: Props) {
  const [title, setTitle] = useState(card?.title ?? '');
  const [description, setDescription] = useState(card?.description ?? '');
  const [priority, setPriority] = useState<Priority>(card?.priority ?? 'MEDIUM');
  const [tag, setTag] = useState(card?.tag ?? '');
  const [assignedTo, setAssignedTo] = useState<string>(card?.assignedTo ?? '');
  const [users, setUsers] = useState<string[]>([]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  useEffect(() => {
    kanbanApi.getUsers().then(setUsers).catch(() => {});
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      description: description.trim(),
      priority,
      tag: tag.trim(),
      assignedTo: assignedTo || null,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2>{card ? 'Modifier la carte' : 'Nouvelle carte'}</h2>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal__form">
          <div className="modal__field">
            <label>Titre *</label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre de la carte"
            />
          </div>
          <div className="modal__field">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description optionnelle..."
              rows={3}
            />
          </div>
          <div className="modal__row">
            <div className="modal__field">
              <label>Priorité</label>
              <div className="priority-select">
                {PRIORITIES.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    className={`priority-btn priority-btn--${p.value.toLowerCase()} ${priority === p.value ? 'active' : ''}`}
                    onClick={() => setPriority(p.value)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="modal__field">
              <label>Tag</label>
              <input
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="ex: Frontend, Bug..."
              />
            </div>
          </div>
          <div className="modal__field">
            <label>Assigner à</label>
            <div className="assignee-select">
              <button
                type="button"
                className={`assignee-btn ${assignedTo === '' ? 'active' : ''}`}
                onClick={() => setAssignedTo('')}
              >
                <span className="assignee-btn__avatar assignee-btn__avatar--none">–</span>
                <span>Non assigné</span>
              </button>
              {users.map((u) => (
                <button
                  key={u}
                  type="button"
                  className={`assignee-btn ${assignedTo === u ? 'active' : ''}`}
                  onClick={() => setAssignedTo(u)}
                >
                  <span className="assignee-btn__avatar">{u[0].toUpperCase()}</span>
                  <span>{u}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="modal__actions">
            <button type="button" className="btn btn--ghost" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn btn--primary" disabled={!title.trim()}>
              {card ? 'Sauvegarder' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
