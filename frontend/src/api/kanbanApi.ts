import { Card, Column } from '../types/kanban';

const BASE = 'http://localhost:8080/api';

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

function handleResponse(res: Response) {
  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.reload();
    throw new Error('Session expirée, veuillez vous reconnecter.');
  }
  if (!res.ok) throw new Error(`Erreur ${res.status}`);
}

export const kanbanApi = {
  async getColumns(): Promise<Column[]> {
    const res = await fetch(`${BASE}/columns`, { headers: authHeaders() });
    handleResponse(res);
    return res.json();
  },

  async createColumn(name: string, color: string): Promise<Column> {
    const res = await fetch(`${BASE}/columns`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ name, color }),
    });
    handleResponse(res);
    return res.json();
  },

  async updateColumn(id: number, name: string, color: string): Promise<Column> {
    const res = await fetch(`${BASE}/columns/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ name, color }),
    });
    handleResponse(res);
    return res.json();
  },

  async deleteColumn(id: number): Promise<void> {
    const res = await fetch(`${BASE}/columns/${id}`, { method: 'DELETE', headers: authHeaders() });
    handleResponse(res);
  },

  async createCard(columnId: number, data: Partial<Card>): Promise<Card> {
    const res = await fetch(`${BASE}/cards/column/${columnId}`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    handleResponse(res);
    return res.json();
  },

  async updateCard(id: number, data: Partial<Card>): Promise<Card> {
    const res = await fetch(`${BASE}/cards/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    handleResponse(res);
    return res.json();
  },

  async moveCard(id: number, targetColumnId: number, position: number): Promise<Card> {
    const res = await fetch(`${BASE}/cards/${id}/move`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ targetColumnId, position }),
    });
    handleResponse(res);
    return res.json();
  },

  async deleteCard(id: number): Promise<void> {
    const res = await fetch(`${BASE}/cards/${id}`, { method: 'DELETE', headers: authHeaders() });
    handleResponse(res);
  },
};
