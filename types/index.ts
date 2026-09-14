export type TripType = 'beach' | 'hiking' | 'conference' | 'hospital';

export interface ChecklistItem {
  id: string;
  name: string;
  category: 'medical' | 'documents' | 'essentials' | 'tech' | 'clothing';
  packed: boolean;
  photoUri?: string;
}

export interface TripPack {
  id: string;
  tripType: TripType;
  title: string;
  createdAt: string;
  items: ChecklistItem[];
}

export interface TripTemplate {
  id: TripType;
  title: string;
  emoji: string;
  description: string;
  color: string;
  items: Omit<ChecklistItem, 'packed' | 'photoUri'>[];
}
