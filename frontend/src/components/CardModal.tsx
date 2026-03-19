import { useState, useEffect } from 'react';
import { Card, Priority } from '../types/kanban';
import { kanbanApi } from '../api/kanbanApi';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  card?: Card | null;
  columnId: number;
  onSave: (data: Partial<Card>) => void;
  onClose: () => void;
}

export function CardModal({ card, onSave, onClose }: Props) {
  const { tr } = useLanguage();
  const cm = tr.cardModal;

  const PRIORITIES: { value: Priority; label: string }[] = [
    { value: 'LOW',    label: cm.priorities.LOW },
    { value: 'MEDIUM', label: cm.priorities.MEDIUM },
    { value: 'HIGH',   label: cm.priorities.HIGH },
    { value: 'URGENT', label: cm.priorities.URGENT },
  ];

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
          <h2>{card ? cm.editTitle : cm.newTitle}</h2>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal__form">
          <div className="modal__field">
            <label>{cm.titleLabel}</label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={cm.titlePlaceholder}
            />
          </div>
          <div className="modal__field">
            <label>{cm.description}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={cm.descriptionPlaceholder}
              rows={3}
            />
          </div>
          <div className="modal__row">
            <div className="modal__field">
              <label>{cm.priority}</label>
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
              <label>{cm.tag}</label>
              <input
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder={cm.tagPlaceholder}
              />
            </div>
          </div>
          <div className="modal__field">
            <label>{cm.assignTo}</label>
            <select
              className="assignee-dropdown"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
            >
              <option value="">{cm.unassigned}</option>
              {users.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
          <div className="modal__actions">
            <button type="button" className="btn btn--ghost" onClick={onClose}>{cm.cancel}</button>
            <button type="submit" className="btn btn--primary" disabled={!title.trim()}>
              {card ? cm.save : cm.create}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
