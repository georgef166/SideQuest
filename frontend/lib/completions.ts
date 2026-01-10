import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface CompletedQuest {
  user_id: string;
  quest_id: string;
  quest_title: string;
  completed_at: Date;
  rating?: number;
  feedback?: string;
  xp_earned: number;
}

export interface UserStats {
  total_quests_completed: number;
  total_xp: number;
  favorite_categories: string[];
  last_completed?: Date;
}

export const completeQuest = async (
  userId: string,
  questId: string,
  questTitle: string,
  rating?: number,
  feedback?: string
): Promise<{ xp_earned: number }> => {
  try {
    const xpEarned = 100; // Base XP
    const bonusXP = rating === 5 ? 50 : rating === 4 ? 25 : 0;
    const totalXP = xpEarned + bonusXP;

    // Save completion
    const completionRef = doc(db, 'completions', `${userId}_${questId}_${Date.now()}`);
    const completionData: any = {
      user_id: userId,
      quest_id: questId,
      quest_title: questTitle,
      completed_at: Timestamp.fromDate(new Date()),
      xp_earned: totalXP,
    };
    
    // Only add rating and feedback if they are defined
    if (rating !== undefined) completionData.rating = rating;
    if (feedback !== undefined && feedback !== '') completionData.feedback = feedback;
    
    await setDoc(completionRef, completionData);

    // Update user stats
    await updateUserStats(userId, totalXP);

    return { xp_earned: totalXP };
  } catch (error) {
    console.error('Error completing quest:', error);
    throw error;
  }
};

export const updateUserStats = async (
  userId: string,
  xpToAdd: number
): Promise<void> => {
  try {
    const statsRef = doc(db, 'user_stats', userId);
    const statsSnap = await getDoc(statsRef);

    if (statsSnap.exists()) {
      const currentStats = statsSnap.data() as UserStats;
      await setDoc(statsRef, {
        total_quests_completed: (currentStats.total_quests_completed || 0) + 1,
        total_xp: (currentStats.total_xp || 0) + xpToAdd,
        last_completed: Timestamp.fromDate(new Date()),
      }, { merge: true });
    } else {
      await setDoc(statsRef, {
        total_quests_completed: 1,
        total_xp: xpToAdd,
        last_completed: Timestamp.fromDate(new Date()),
        favorite_categories: [],
      });
    }
  } catch (error) {
    console.error('Error updating user stats:', error);
    throw error;
  }
};

export const getUserStats = async (userId: string): Promise<UserStats> => {
  try {
    const statsRef = doc(db, 'user_stats', userId);
    const statsSnap = await getDoc(statsRef);

    if (statsSnap.exists()) {
      const data = statsSnap.data();
      return {
        total_quests_completed: data.total_quests_completed || 0,
        total_xp: data.total_xp || 0,
        favorite_categories: data.favorite_categories || [],
        last_completed: data.last_completed?.toDate(),
      };
    }

    return {
      total_quests_completed: 0,
      total_xp: 0,
      favorite_categories: [],
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    throw error;
  }
};
