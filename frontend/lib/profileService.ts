import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { UserProfile, ProfileFormData } from './profileTypes';

export async function getProfileByUid(uid: string): Promise<UserProfile | null> {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
}

export async function createOrUpdateProfile(
  uid: string,
  formData: Partial<ProfileFormData>,
  authUser?: { displayName?: string; photoURL?: string; email: string }
): Promise<UserProfile> {
  try {
    const docRef = doc(db, 'users', uid);
    const now = Timestamp.now();

    // Calculate profile completion percentage
    const completionPercentage = calculateProfileCompletion(formData);

    const profileUpdate = {
      uid,
      email: authUser?.email || '',
      emailVerified: true,
      displayName: authUser?.displayName || formData.profile?.legalName || '',
      photoURL: authUser?.photoURL || '',
      authCreatedAt: now,
      
      profile: {
        legalName: formData.profile?.legalName || '',
        preferredName: formData.profile?.preferredName || '',
        aboutMe: formData.profile?.aboutMe || '',
        photoURL: formData.profile?.photoURL || authUser?.photoURL || '',
        updatedAt: now,
      },

      lifestyle: {
        location: formData.lifestyle?.location || '',
        education: formData.lifestyle?.education || '',
        work: formData.lifestyle?.work || '',
        questVibe: formData.lifestyle?.questVibe || [],
        budgetComfort: formData.lifestyle?.budgetComfort || 'moderate',
        transportation: formData.lifestyle?.transportation || [],
        dietaryPreferences: formData.lifestyle?.dietaryPreferences || [],
        updatedAt: now,
      },

      preferences: {
        accessibilityNeeds: formData.preferences?.accessibilityNeeds || [],
        timePreference: formData.preferences?.timePreference || '',
        favoriteCategories: formData.preferences?.favoriteCategories || [],
        energyLevel: formData.preferences?.energyLevel || '',
        socialComfort: formData.preferences?.socialComfort || '',
        hiddenGemsSeeker: formData.preferences?.hiddenGemsSeeker || '',
        pacePref: formData.preferences?.pacePref || '',
        localKnowledge: formData.preferences?.localKnowledge || '',
        updatedAt: now,
      },

      stats: {
        questsCompleted: 0,
        currentStreak: 0,
        favoritesCount: 0,
        lastQuestDate: null,
        profileCompletionPercentage: completionPercentage,
      },

      createdAt: now,
      lastUpdated: now,
    };

    // Check if profile exists
    const existingDoc = await getDoc(docRef);
    if (existingDoc.exists()) {
      const existing = existingDoc.data();
      // Update existing - preserve stats and createdAt
      await updateDoc(docRef, {
        ...profileUpdate,
        stats: {
          questsCompleted: existing.stats?.questsCompleted || 0,
          currentStreak: existing.stats?.currentStreak || 0,
          favoritesCount: existing.stats?.favoritesCount || 0,
          lastQuestDate: existing.stats?.lastQuestDate || null,
          profileCompletionPercentage: completionPercentage,
        },
        createdAt: existing.createdAt || now,
        lastUpdated: now,
      });
    } else {
      // Create new
      await setDoc(docRef, profileUpdate);
    }

    const updated = await getDoc(docRef);
    const data = updated.data() as UserProfile;
    console.log('Profile saved/updated:', data);
    return data;
  } catch (error) {
    console.error('Error creating/updating profile:', error);
    throw error;
  }
}

export async function updateProfileField(
  uid: string,
  section: 'profile' | 'lifestyle' | 'preferences',
  updates: Record<string, any>
): Promise<void> {
  try {
    const docRef = doc(db, 'users', uid);
    const updateData: Record<string, any> = {
      lastUpdated: Timestamp.now(),
    };

    updateData[`${section}.${Object.keys(updates)[0]}`] = Object.values(updates)[0];

    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('Error updating profile field:', error);
    throw error;
  }
}

export function calculateProfileCompletion(data: Partial<ProfileFormData>): number {
  const requiredFields = {
    'profile.legalName': !!data.profile?.legalName && data.profile.legalName.length > 0,
    'profile.aboutMe': !!data.profile?.aboutMe && data.profile.aboutMe.length > 0,
    'lifestyle.location': !!data.lifestyle?.location && data.lifestyle.location.length > 0,
    'lifestyle.questVibe': !!data.lifestyle?.questVibe && data.lifestyle.questVibe.length > 0,
    'lifestyle.budgetComfort': !!data.lifestyle?.budgetComfort,
    'preferences.favoriteCategories':
      !!data.preferences?.favoriteCategories && data.preferences.favoriteCategories.length > 0,
    'preferences.accessibilityNeeds':
      !!data.preferences?.accessibilityNeeds && data.preferences.accessibilityNeeds.length > 0,
    'profile.photoURL': !!data.profile?.photoURL,
  };

  const completed = Object.values(requiredFields).filter(Boolean).length;
  const total = Object.keys(requiredFields).length;

  return Math.round((completed / total) * 100);
}

export function getIncompleteFields(data: Partial<ProfileFormData>): string[] {
  const incomplete: string[] = [];

  if (!data.profile?.legalName || data.profile.legalName.trim().length === 0) {
    incomplete.push('Add your legal name');
  }
  if (!data.profile?.aboutMe || data.profile.aboutMe.trim().length === 0) {
    incomplete.push('Add your intro');
  }
  if (!data.lifestyle?.location || data.lifestyle.location.trim().length === 0) {
    incomplete.push('Add where you live');
  }
  if (!data.lifestyle?.questVibe || data.lifestyle.questVibe.length === 0) {
    incomplete.push('Set your quest vibe');
  }
  if (!data.preferences?.favoriteCategories || data.preferences.favoriteCategories.length === 0) {
    incomplete.push('Choose your favorite categories');
  }

  return incomplete.slice(0, 3);
}
