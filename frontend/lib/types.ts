export interface Quest {
  quest_id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  estimated_time: number;
  estimated_cost: number;
  steps: QuestStep[];
  tags: string[];
  best_time?: string;
  distance?: number;
  created_at: string;
}

export interface QuestStep {
  order: number;
  type: 'place' | 'event';
  item_id: string;
  name: string;
  description?: string;
  estimated_time?: number;
  location: Location;
}

export interface Location {
  lat: number;
  lng: number;
}

export interface Place {
  place_id: string;
  name: string;
  category: string;
  address?: string;
  rating?: number;
  price_level?: number;
  photo_url?: string;
  distance?: number;
}

export interface UserPreferences {
  budget?: 'broke' | 'moderate' | 'bougie';
  radius?: number;
  categories?: string[];
  mood?: string;
}
