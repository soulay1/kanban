import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '../types/kanban';

interface Props {
  card: Card;
  onEdit: (card: Card) => void;
  onDelete: (id: number) => void;
}

const PRIORITY_CONFIG = {
  LOW:    { label: 'Faible',  color: '#22c55e', bg: '#f0fdf4' },
  MEDIUM: { label: 'Moyen',   color: '#f59e0b', bg: '#fffbeb' },
  HIGH:   { label: 'Élevé',   color: '#ef4444', bg: '#fef2f2' },
  URGENT: { label: 'Urgent',  color: '#7c3aed', bg: '#f5f3ff' },
};

export function KanbanCard({ card, onEdit, onDelete }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `card-${card.id}`,
    data: { type: 'card', card },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const p = PRIORITY_CONFIG[card.priority];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`kanban-card ${isDragging ? 'kanban-card--dragging' : ''}`}
    >
      <div className="kanban-card__drag" {...attributes} {...listeners}>⠿</div>

      <div className="kanban-card__body" onClick={() => onEdit(card)}>
        {card.tag && <span className="kanban-card__tag">{card.tag}</span>}
        <p className="kanban-card__title">{card.title}</p>
        {card.description && (
          <p className="kanban-card__desc">{card.description}</p>
        )}
        <div className="kanban-card__footer">
          <span
            className="kanban-card__priority"
            style={{ color: p.color, background: p.bg }}
          >
            {p.label}
          </span>
        </div>
      </div>

      <button
        className="kanban-card__delete"
        onClick={(e) => { e.stopPropagation(); onDelete(card.id); }}
        title="Supprimer"
      >✕</button>
    </div>
  );
}
