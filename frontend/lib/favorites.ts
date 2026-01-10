import { collection, doc, setDoc, deleteDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { Quest } from './types';

export interface Favorite {
  user_id: string;
  item_id: string;
  item_type: 'quest' | 'place' | 'event';
  quest_data?: Quest;
  notes?: string;
  added_at: Date;
}

export const addToFavorites = async (
  userId: string,
  itemId: string,
  itemType: 'quest' | 'place' | 'event',
  questData?: Quest,
  notes?: string
): Promise<void> => {
  try {
    const favoriteRef = doc(db, 'favorites', `${userId}_${itemId}`);
    const favoriteData: any = {
      user_id: userId,
      item_id: itemId,
      item_type: itemType,
      added_at: Timestamp.fromDate(new Date()),
    };
    
    // Only add optional fields if they are defined
    if (questData !== undefined) favoriteData.quest_data = questData;
    if (notes !== undefined && notes !== '') favoriteData.notes = notes;
    
    await setDoc(favoriteRef, favoriteData);
  } catch (error) {
    console.error('Error adding to favorites:', error);
    throw error;
  }
};

export const removeFromFavorites = async (
  userId: string,
  itemId: string
): Promise<void> => {
  try {
    const favoriteRef = doc(db, 'favorites', `${userId}_${itemId}`);
    await deleteDoc(favoriteRef);
  } catch (error) {
    console.error('Error removing from favorites:', error);
    throw error;
  }
};

export const getFavorites = async (userId: string): Promise<Favorite[]> => {
  try {
    const favoritesQuery = query(
      collection(db, 'favorites'),
      where('user_id', '==', userId)
    );
    
    const snapshot = await getDocs(favoritesQuery);
    const favorites: Favorite[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      favorites.push({
        user_id: data.user_id,
        item_id: data.item_id,
        item_type: data.item_type,
        quest_data: data.quest_data,
        notes: data.notes,
        added_at: data.added_at?.toDate() || new Date(),
      });
    });
    
    return favorites.sort((a, b) => b.added_at.getTime() - a.added_at.getTime());
  } catch (error) {
    console.error('Error getting favorites:', error);
    throw error;
  }
};

export const isFavorite = async (
  userId: string,
  itemId: string
): Promise<boolean> => {
  try {
    const favorites = await getFavorites(userId);
    return favorites.some(fav => fav.item_id === itemId);
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return false;
  }
};
