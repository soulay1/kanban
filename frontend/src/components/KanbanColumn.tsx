import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Column, Card } from '../types/kanban';
import { KanbanCard } from './KanbanCard';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  column: Column;
  onAddCard: (columnId: number) => void;
  onEditCard: (card: Card) => void;
  onDeleteCard: (id: number) => void;
  onDeleteColumn: (id: number) => void;
  onEditColumn: (column: Column) => void;
}

export function KanbanColumn({ column, onAddCard, onEditCard, onDeleteCard, onDeleteColumn, onEditColumn }: Props) {
  const [showMenu, setShowMenu] = useState(false);
  const { tr } = useLanguage();
  const c = tr.column;

  const { setNodeRef, isOver } = useDroppable({
    id: `column-${column.id}`,
    data: { type: 'column', columnId: column.id },
  });

  const cardIds = column.cards.map((card) => `card-${card.id}`);

  return (
    <div className={`kanban-column ${isOver ? 'kanban-column--over' : ''}`}>
      <div className="kanban-column__header" style={{ borderTopColor: column.color }}>
        <div className="kanban-column__title">
          <span className="kanban-column__dot" style={{ background: column.color }} />
          <h3>{column.name}</h3>
          <span className="kanban-column__count">{column.cards.length}</span>
        </div>
        <div className="kanban-column__menu-wrapper">
          <button className="kanban-column__menu-btn" onClick={() => setShowMenu(!showMenu)}>⋯</button>
          {showMenu && (
            <div className="kanban-column__dropdown">
              <button onClick={() => { onEditColumn(column); setShowMenu(false); }}>{c.rename}</button>
              <button className="danger" onClick={() => { onDeleteColumn(column.id); setShowMenu(false); }}>{c.delete}</button>
            </div>
          )}
        </div>
      </div>

      <div ref={setNodeRef} className="kanban-column__cards">
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {column.cards.map((card) => (
            <KanbanCard
              key={card.id}
              card={card}
              onEdit={onEditCard}
              onDelete={onDeleteCard}
            />
          ))}
        </SortableContext>
      </div>

      <button className="kanban-column__add" onClick={() => onAddCard(column.id)}>
        {c.addCard}
      </button>
    </div>
  );
}
