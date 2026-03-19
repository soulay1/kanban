import { useState } from 'react';
import { Column } from '../types/kanban';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  column?: Column | null;
  onSave: (name: string, color: string) => void;
  onClose: () => void;
}

const COLORS = ['#6366f1', '#f59e0b', '#22c55e', '#ef4444', '#3b82f6', '#ec4899', '#14b8a6', '#8b5cf6'];

export function ColumnModal({ column, onSave, onClose }: Props) {
  const [name, setName] = useState(column?.name ?? '');
  const [color, setColor] = useState(column?.color ?? COLORS[0]);
  const { tr } = useLanguage();
  const cm = tr.columnModal;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name.trim(), color);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--small" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2>{column ? cm.editTitle : cm.newTitle}</h2>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal__form">
          <div className="modal__field">
            <label>{cm.name}</label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={cm.namePlaceholder}
            />
          </div>
          <div className="modal__field">
            <label>{cm.color}</label>
            <div className="color-picker">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`color-swatch ${color === c ? 'active' : ''}`}
                  style={{ background: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>
          <div className="modal__actions">
            <button type="button" className="btn btn--ghost" onClick={onClose}>{cm.cancel}</button>
            <button type="submit" className="btn btn--primary" disabled={!name.trim()}>
              {column ? cm.save : cm.create}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
