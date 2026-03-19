export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Board {
  id: number;
  name: string;
  description: string;
  columnCount: number;
  cardCount: number;
  createdAt: string;
}

export interface Card {
  id: number;
  title: string;
  description: string;
  priority: Priority;
  tag: string;
  assignedTo: string | null;
  position: number;
  columnId: number;
  createdAt: string;
}

export interface Column {
  id: number;
  name: string;
  color: string;
  position: number;
  cards: Card[];
}
