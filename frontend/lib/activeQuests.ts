import { doc, setDoc, getDoc, collection, getDocs, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { Quest } from './types';

export interface ActiveQuestRecord {
  quest_id: string;
  quest_data: Quest;
  activated_at: Date;
}

/**
 * Get all active quests for a user
 */
export const getActiveQuests = async (userId: string): Promise<ActiveQuestRecord[]> => {
  try {
    const activeQuestsRef = collection(db, 'users', userId, 'activeQuests');
    const snapshot = await getDocs(activeQuestsRef);
    
    const activeQuests: ActiveQuestRecord[] = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      activeQuests.push({
        quest_id: doc.id,
        quest_data: data.quest_data as Quest,
        activated_at: data.activated_at?.toDate() || new Date(),
      });
    });
    
    return activeQuests;
  } catch (error) {
    console.error('Error getting active quests:', error);
    throw error;
  }
};

/**
 * Check if a quest is active for a user
 */
export const isQuestActive = async (userId: string, questId: string): Promise<boolean> => {
  try {
    const activeQuestRef = doc(db, 'users', userId, 'activeQuests', questId);
    const snapshot = await getDoc(activeQuestRef);
    return snapshot.exists();
  } catch (error) {
    console.error('Error checking if quest is active:', error);
    throw error;
  }
};

/**
 * Activate a quest for a user
 */
export const activateQuest = async (userId: string, quest: Quest): Promise<void> => {
  try {
    const activeQuestRef = doc(db, 'users', userId, 'activeQuests', quest.quest_id);
    await setDoc(activeQuestRef, {
      quest_data: quest,
      activated_at: Timestamp.fromDate(new Date()),
    });
  } catch (error) {
    console.error('Error activating quest:', error);
    throw error;
  }
};

/**
 * Deactivate a quest for a user
 */
export const deactivateQuest = async (userId: string, questId: string): Promise<void> => {
  try {
    const activeQuestRef = doc(db, 'users', userId, 'activeQuests', questId);
    await deleteDoc(activeQuestRef);
  } catch (error) {
    console.error('Error deactivating quest:', error);
    throw error;
  }
};
