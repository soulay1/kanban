export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Card {
  id: number;
  title: string;
  description: string;
  priority: Priority;
  tag: string;
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
