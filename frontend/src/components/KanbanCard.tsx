import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '../types/kanban';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  card: Card;
  onEdit: (card: Card) => void;
  onDelete: (id: number) => void;
}

const PRIORITY_COLORS = {
  LOW:    { color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  MEDIUM: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  HIGH:   { color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  URGENT: { color: '#7c3aed', bg: 'rgba(124,58,237,0.12)' },
};

const AVATAR_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
  '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6',
];

function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function KanbanCard({ card, onEdit, onDelete }: Props) {
  const { tr } = useLanguage();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `card-${card.id}`,
    data: { type: 'card', card },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const pc = PRIORITY_COLORS[card.priority];
  const label = tr.card.priorities[card.priority];

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
            style={{ color: pc.color, background: pc.bg }}
          >
            {label}
          </span>
          {card.assignedTo && (
            <span
              className="kanban-card__assignee"
              style={{ background: avatarColor(card.assignedTo) }}
              title={card.assignedTo}
            >
              {card.assignedTo[0].toUpperCase()}
            </span>
          )}
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
