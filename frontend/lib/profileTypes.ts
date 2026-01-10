import { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string;
  emailVerified: boolean;
  displayName: string;
  photoURL?: string;
  authCreatedAt: Timestamp | string;

  profile: {
    legalName: string;
    preferredName?: string;
    aboutMe?: string;
    photoURL?: string;
    updatedAt: Timestamp | string;
  };

  lifestyle: {
    location?: string;
    education?: string;
    work?: string;
    questVibe: Array<'chill' | 'social' | 'energetic' | 'adventurous'>;
    budgetComfort: 'broke' | 'moderate' | 'bougie';
    transportation?: Array<'walk' | 'transit' | 'drive' | 'bike'>;
    dietaryPreferences?: string[];
    updatedAt: Timestamp | string;
  };

  preferences: {
    accessibilityNeeds?: Array<'step-free' | 'quiet' | 'parking' | 'accessible washroom' | 'wheelchair ramp'>;
    timePreference?: 'spontaneous' | 'planned' | 'flexible';
    favoriteCategories?: Array<'food' | 'outdoors' | 'nightlife' | 'study spots' | 'arts' | 'free stuff' | 'shopping' | 'sports'>;
    energyLevel?: 'low' | 'medium' | 'high';
    socialComfort?: Array<'solo adventurer' | 'small group (2-3)' | 'group adventures (4+)'>;
    updatedAt: Timestamp | string;
  };

  stats: {
    questsCompleted: number;
    currentStreak: number;
    favoritesCount: number;
    lastQuestDate?: Timestamp | string;
    profileCompletionPercentage: number;
  };

  createdAt: Timestamp | string;
  lastUpdated: Timestamp | string;
}

export interface ProfileFormData {
  profile: {
    legalName: string;
    preferredName?: string;
    aboutMe?: string;
    photoURL?: string;
  };
  lifestyle: {
    location?: string;
    education?: string;
    work?: string;
    questVibe: Array<'chill' | 'social' | 'energetic' | 'adventurous'>;
    budgetComfort: 'broke' | 'moderate' | 'bougie';
    transportation?: Array<'walk' | 'transit' | 'drive' | 'bike'>;
    dietaryPreferences?: string[];
  };
  preferences: {
    accessibilityNeeds?: Array<'step-free' | 'quiet' | 'parking' | 'accessible washroom' | 'wheelchair ramp'>;
    timePreference?: 'spontaneous' | 'planned' | 'flexible';
    favoriteCategories?: Array<'food' | 'outdoors' | 'nightlife' | 'study spots' | 'arts' | 'free stuff' | 'shopping' | 'sports'>;
    energyLevel?: 'low' | 'medium' | 'high';
    socialComfort?: Array<'solo adventurer' | 'small group (2-3)' | 'group adventures (4+)'>;
  };
}

export type VibeOption = 'chill' | 'social' | 'energetic' | 'adventurous';
export type BudgetOption = 'broke' | 'moderate' | 'bougie';
export type TransportOption = 'walk' | 'transit' | 'drive' | 'bike';
export type AccessibilityOption = 'step-free' | 'quiet' | 'parking' | 'accessible washroom' | 'wheelchair ramp';
export type CategoryOption = 'food' | 'outdoors' | 'nightlife' | 'study spots' | 'arts' | 'free stuff' | 'shopping' | 'sports';
export type EnergyOption = 'low' | 'medium' | 'high';
export type SocialOption = 'solo adventurer' | 'small group (2-3)' | 'group adventures (4+)';

export const VIBE_OPTIONS = [
  { value: 'chill', label: 'Chill' },
  { value: 'social', label: 'Social' },
  { value: 'energetic', label: 'Energetic' },
  { value: 'adventurous', label: 'Adventurous' },
];

export const BUDGET_OPTIONS = [
  { value: 'broke', label: 'Broke (budget conscious)' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'bougie', label: 'Bougie (spendable)' },
];

export const TRANSPORT_OPTIONS = [
  { value: 'walk', label: 'Walking' },
  { value: 'transit', label: 'Public Transit' },
  { value: 'drive', label: 'Driving' },
  { value: 'bike', label: 'Biking' },
];

export const ACCESSIBILITY_OPTIONS = [
  { value: 'step-free', label: 'Step-free access' },
  { value: 'quiet', label: 'Quiet spaces' },
  { value: 'parking', label: 'Parking availability' },
  { value: 'accessible washroom', label: 'Accessible washroom' },
  { value: 'wheelchair ramp', label: 'Wheelchair ramp' },
];

export const CATEGORY_OPTIONS = [
  { value: 'food', label: 'Food & Dining' },
  { value: 'outdoors', label: 'Outdoors' },
  { value: 'nightlife', label: 'Nightlife' },
  { value: 'study spots', label: 'Study Spots' },
  { value: 'arts', label: 'Arts & Culture' },
  { value: 'free stuff', label: 'Free Stuff' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'sports', label: 'Sports' },
];

export const ENERGY_OPTIONS = [
  { value: 'low', label: 'Low (chill vibes)' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High (active)' },
];

export const SOCIAL_OPTIONS = [
  { value: 'solo adventurer', label: 'Solo adventurer' },
  { value: 'small group (2-3)', label: 'Small group (2-3 people)' },
  { value: 'group adventures (4+)', label: 'Group adventures (4+)' },
];
