import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface UserPreferences {
  budget?: 'broke' | 'moderate' | 'bougie';
  radius?: [number, number]; // min, max
  categories?: string[];
  mood?: string;
  lastLocation?: {
    lat: number;
    lng: number;
  };
  sortBy?: string;
  onboardingCompleted?: boolean;
}

export const saveUserPreferences = async (
  userId: string,
  preferences: UserPreferences
): Promise<void> => {
  try {
    const userRef = doc(db, 'user_preferences', userId);
    
    // Remove undefined fields to avoid Firestore errors
    const cleanedPreferences: any = {};
    Object.keys(preferences).forEach((key) => {
      const value = (preferences as any)[key];
      if (value !== undefined) {
        cleanedPreferences[key] = value;
      }
    });
    
    await setDoc(userRef, cleanedPreferences, { merge: true });
  } catch (error) {
    console.error('Error saving preferences:', error);
    throw error;
  }
};

export const getUserPreferences = async (
  userId: string
): Promise<UserPreferences | null> => {
  try {
    const userRef = doc(db, 'user_preferences', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data() as UserPreferences;
    }

    return null;
  } catch (error) {
    console.error('Error getting preferences:', error);
    return null;
  }
};
