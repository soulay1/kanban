import { Card, Column } from '../types/kanban';

const BASE = 'http://localhost:8080/api';

export const kanbanApi = {
  async getColumns(): Promise<Column[]> {
    const res = await fetch(`${BASE}/columns`);
    if (!res.ok) throw new Error('Erreur serveur');
    return res.json();
  },

  async createColumn(name: string, color: string): Promise<Column> {
    const res = await fetch(`${BASE}/columns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, color }),
    });
    if (!res.ok) throw new Error('Erreur création colonne');
    return res.json();
  },

  async updateColumn(id: number, name: string, color: string): Promise<Column> {
    const res = await fetch(`${BASE}/columns/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, color }),
    });
    if (!res.ok) throw new Error('Erreur mise à jour colonne');
    return res.json();
  },

  async deleteColumn(id: number): Promise<void> {
    const res = await fetch(`${BASE}/columns/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Erreur suppression colonne');
  },

  async createCard(columnId: number, data: Partial<Card>): Promise<Card> {
    const res = await fetch(`${BASE}/cards/column/${columnId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Erreur création carte');
    return res.json();
  },

  async updateCard(id: number, data: Partial<Card>): Promise<Card> {
    const res = await fetch(`${BASE}/cards/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Erreur mise à jour carte');
    return res.json();
  },

  async moveCard(id: number, targetColumnId: number, position: number): Promise<Card> {
    const res = await fetch(`${BASE}/cards/${id}/move`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetColumnId, position }),
    });
    if (!res.ok) throw new Error('Erreur déplacement carte');
    return res.json();
  },

  async deleteCard(id: number): Promise<void> {
    const res = await fetch(`${BASE}/cards/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Erreur suppression carte');
  },
};
