import { useEffect, useState, useCallback } from 'react';
import {
  DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent,
  PointerSensor, useSensor, useSensors, closestCorners,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Board, Column, Card } from './types/kanban';
import { kanbanApi } from './api/kanbanApi';
import { KanbanColumn } from './components/KanbanColumn';
import { KanbanCard } from './components/KanbanCard';
import { CardModal } from './components/CardModal';
import { ColumnModal } from './components/ColumnModal';
import { AuthPage } from './pages/AuthPage';
import { BoardsPage } from './pages/BoardsPage';
import { useAuth } from './context/AuthContext';
import './App.css';

type CardModalState = { columnId: number; card?: Card } | null;
type ColumnModalState = { column?: Column } | null;

function App() {
  const { token, username, logout } = useAuth();
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [cardModal, setCardModal] = useState<CardModalState>(null);
  const [columnModal, setColumnModal] = useState<ColumnModalState>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const loadColumns = useCallback(async () => {
    if (!selectedBoard) return;
    try {
      setLoading(true);
      const data = await kanbanApi.getColumns(selectedBoard.id);
      setColumns(data);
      setError(null);
    } catch {
      setError('Impossible de se connecter au serveur.');
    } finally {
      setLoading(false);
    }
  }, [selectedBoard]);

  useEffect(() => {
    if (token && selectedBoard) loadColumns();
  }, [loadColumns, token, selectedBoard]);

  if (!token) return <AuthPage />;
  if (!selectedBoard) return <BoardsPage onSelectBoard={setSelectedBoard} />;

  const handleDragStart = (event: DragStartEvent) => {
    const { data } = event.active;
    if (data.current?.type === 'card') setActiveCard(data.current.card);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) return;

    const activeCardId = parseInt(activeId.replace('card-', ''));
    const isOverColumn = overId.startsWith('column-');
    const isOverCard = overId.startsWith('card-');

    setColumns((cols) => {
      const sourceColIndex = cols.findIndex((c) => c.cards.some((card) => card.id === activeCardId));
      if (sourceColIndex === -1) return cols;

      let destColIndex: number;
      if (isOverColumn) {
        const destColId = parseInt(overId.replace('column-', ''));
        destColIndex = cols.findIndex((c) => c.id === destColId);
      } else if (isOverCard) {
        const overCardId = parseInt(overId.replace('card-', ''));
        destColIndex = cols.findIndex((c) => c.cards.some((card) => card.id === overCardId));
      } else return cols;

      if (destColIndex === -1 || sourceColIndex === destColIndex) return cols;

      const newCols = [...cols];
      const sourceCards = [...newCols[sourceColIndex].cards];
      const destCards = [...newCols[destColIndex].cards];
      const cardIndex = sourceCards.findIndex((c) => c.id === activeCardId);
      const [movedCard] = sourceCards.splice(cardIndex, 1);
      destCards.push(movedCard);
      newCols[sourceColIndex] = { ...newCols[sourceColIndex], cards: sourceCards };
      newCols[destColIndex] = { ...newCols[destColIndex], cards: destCards };
      return newCols;
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    const activeCardId = parseInt(activeId.replace('card-', ''));
    const isOverCard = overId.startsWith('card-');
    const isOverColumn = overId.startsWith('column-');

    const destCol = columns.find((c) => c.cards.some((card) => card.id === activeCardId));
    if (!destCol) return;

    let newPosition = destCol.cards.findIndex((c) => c.id === activeCardId);

    if (isOverCard) {
      const overCardId = parseInt(overId.replace('card-', ''));
      const activeIdx = destCol.cards.findIndex((c) => c.id === activeCardId);
      const overIdx = destCol.cards.findIndex((c) => c.id === overCardId);
      if (activeIdx !== overIdx) {
        setColumns((cols) =>
          cols.map((col) => {
            if (col.id !== destCol.id) return col;
            return { ...col, cards: arrayMove(col.cards, activeIdx, overIdx) };
          })
        );
        newPosition = overIdx;
      }
    }

    try {
      await kanbanApi.moveCard(activeCardId, destCol.id, newPosition);
    } catch {
      loadColumns();
    }

    if (isOverColumn || isOverCard) {
      // handled optimistically
    }
  };

  const handleSaveCard = async (data: Partial<Card>) => {
    if (!cardModal) return;
    try {
      if (cardModal.card) {
        const updated = await kanbanApi.updateCard(cardModal.card.id, data);
        setColumns((cols) =>
          cols.map((col) => ({
            ...col,
            cards: col.cards.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)),
          }))
        );
      } else {
        const newCard = await kanbanApi.createCard(cardModal.columnId, data);
        setColumns((cols) =>
          cols.map((col) =>
            col.id === cardModal.columnId ? { ...col, cards: [...col.cards, newCard] } : col
          )
        );
      }
      setCardModal(null);
    } catch {
      setError('Erreur lors de la sauvegarde de la carte.');
    }
  };

  const handleDeleteCard = async (id: number) => {
    try {
      await kanbanApi.deleteCard(id);
      setColumns((cols) =>
        cols.map((col) => ({ ...col, cards: col.cards.filter((c) => c.id !== id) }))
      );
    } catch {
      setError('Erreur lors de la suppression.');
    }
  };

  const handleSaveColumn = async (name: string, color: string) => {
    if (!selectedBoard) return;
    try {
      if (columnModal?.column) {
        const updated = await kanbanApi.updateColumn(selectedBoard.id, columnModal.column.id, name, color);
        setColumns((cols) => cols.map((c) => (c.id === updated.id ? { ...c, name: updated.name, color: updated.color } : c)));
      } else {
        const newCol = await kanbanApi.createColumn(selectedBoard.id, name, color);
        setColumns((cols) => [...cols, { ...newCol, cards: [] }]);
      }
      setColumnModal(null);
    } catch {
      setError('Erreur lors de la sauvegarde de la colonne.');
    }
  };

  const handleDeleteColumn = async (id: number) => {
    if (!selectedBoard) return;
    if (!confirm('Supprimer cette colonne et toutes ses cartes ?')) return;
    try {
      await kanbanApi.deleteColumn(selectedBoard.id, id);
      setColumns((cols) => cols.filter((c) => c.id !== id));
    } catch {
      setError('Erreur lors de la suppression.');
    }
  };

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__header-left">
          <div className="app__logo">K</div>
          <div>
            <button
              className="breadcrumb-btn"
              onClick={() => { setSelectedBoard(null); setColumns([]); }}
              title="Retour aux boards"
            >
              Mes boards
            </button>
            <span className="breadcrumb-sep"> / </span>
            <span className="breadcrumb-current">{selectedBoard.name}</span>
          </div>
        </div>
        <div className="app__header-right">
          <p className="board-stats">{columns.length} colonne{columns.length !== 1 ? 's' : ''} · {columns.reduce((acc, c) => acc + c.cards.length, 0)} carte{columns.reduce((acc, c) => acc + c.cards.length, 0) !== 1 ? 's' : ''}</p>
          <button className="btn btn--primary" onClick={() => setColumnModal({})}>
            + Nouvelle colonne
          </button>
          <div className="app__user">
            <span className="app__user-avatar">{username?.[0]?.toUpperCase()}</span>
            <span className="app__username">{username}</span>
            <button className="app__logout" onClick={logout} title="Se déconnecter">↩</button>
          </div>
        </div>
      </header>

      <main className="app__main">
        {error && (
          <div className="app__error">
            {error}
            <button className="btn btn--ghost-sm" onClick={loadColumns}>Réessayer</button>
          </div>
        )}

        {loading ? (
          <div className="app__loading">
            <div className="spinner" />
            <span>Chargement du board...</span>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="board">
              {columns.length === 0 ? (
                <div className="board__empty">
                  <div className="board__empty-icon">📋</div>
                  <h2>Ce board est vide</h2>
                  <p>Créez votre première colonne pour commencer</p>
                  <button className="btn btn--primary" onClick={() => setColumnModal({})}>
                    + Créer une colonne
                  </button>
                </div>
              ) : (
                columns.map((col) => (
                  <KanbanColumn
                    key={col.id}
                    column={col}
                    onAddCard={(colId) => setCardModal({ columnId: colId })}
                    onEditCard={(card) => setCardModal({ columnId: card.columnId, card })}
                    onDeleteCard={handleDeleteCard}
                    onDeleteColumn={handleDeleteColumn}
                    onEditColumn={(column) => setColumnModal({ column })}
                  />
                ))
              )}
            </div>

            <DragOverlay>
              {activeCard && (
                <KanbanCard
                  card={activeCard}
                  onEdit={() => {}}
                  onDelete={() => {}}
                />
              )}
            </DragOverlay>
          </DndContext>
        )}
      </main>

      {cardModal && (
        <CardModal
          card={cardModal.card}
          columnId={cardModal.columnId}
          onSave={handleSaveCard}
          onClose={() => setCardModal(null)}
        />
      )}

      {columnModal !== null && (
        <ColumnModal
          column={columnModal.column}
          onSave={handleSaveColumn}
          onClose={() => setColumnModal(null)}
        />
      )}
    </div>
  );
}

export default App;
