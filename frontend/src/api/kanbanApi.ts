import { Board, Card, Column } from '../types/kanban';

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
  // Profile
  async updateProfile(currentPassword: string, newUsername?: string, newPassword?: string): Promise<{ token: string; username: string }> {
    const res = await fetch(`${BASE}/users/me`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ currentPassword, newUsername: newUsername || null, newPassword: newPassword || null }),
    });
    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      window.location.reload();
      throw new Error('Session expirée');
    }
    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || `Erreur ${res.status}`);
    }
    return res.json();
  },

  // Users
  async getUsers(): Promise<string[]> {
    const res = await fetch(`${BASE}/users`, { headers: authHeaders() });
    handleResponse(res);
    return res.json();
  },

  // Boards
  async getBoards(): Promise<Board[]> {
    const res = await fetch(`${BASE}/boards`, { headers: authHeaders() });
    handleResponse(res);
    return res.json();
  },

  async createBoard(name: string, description: string): Promise<Board> {
    const res = await fetch(`${BASE}/boards`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ name, description }),
    });
    handleResponse(res);
    return res.json();
  },

  async updateBoard(id: number, name: string, description: string): Promise<Board> {
    const res = await fetch(`${BASE}/boards/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ name, description }),
    });
    handleResponse(res);
    return res.json();
  },

  async deleteBoard(id: number): Promise<void> {
    const res = await fetch(`${BASE}/boards/${id}`, { method: 'DELETE', headers: authHeaders() });
    handleResponse(res);
  },

  // Columns
  async getColumns(boardId: number): Promise<Column[]> {
    const res = await fetch(`${BASE}/boards/${boardId}/columns`, { headers: authHeaders() });
    handleResponse(res);
    return res.json();
  },

  async createColumn(boardId: number, name: string, color: string): Promise<Column> {
    const res = await fetch(`${BASE}/boards/${boardId}/columns`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ name, color }),
    });
    handleResponse(res);
    return res.json();
  },

  async updateColumn(boardId: number, id: number, name: string, color: string): Promise<Column> {
    const res = await fetch(`${BASE}/boards/${boardId}/columns/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ name, color }),
    });
    handleResponse(res);
    return res.json();
  },

  async deleteColumn(boardId: number, id: number): Promise<void> {
    const res = await fetch(`${BASE}/boards/${boardId}/columns/${id}`, { method: 'DELETE', headers: authHeaders() });
    handleResponse(res);
  },

  // Cards
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
