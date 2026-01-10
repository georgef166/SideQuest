import { useEffect, useRef } from 'react';
import { useAuth } from './useAuth';
import { getProfileByUid, createOrUpdateProfile } from './profileService';

export function useInitializeProfile() {
  const { user } = useAuth();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!user || hasInitialized.current) return;

    hasInitialized.current = true;

    async function initProfile() {
      try {
        const existingProfile = await getProfileByUid(user.uid);
        if (!existingProfile) {
          // Create initial profile with auth data
          console.log('Creating initial profile for user:', user.uid);
          await createOrUpdateProfile(
            user.uid,
            {
              profile: {
                legalName: user.displayName || '',
                preferredName: '',
                aboutMe: '',
                photoURL: user.photoURL || '',
              },
              lifestyle: {
                questVibe: [],
                budgetComfort: 'moderate',
              },
              preferences: {},
            },
            {
              displayName: user.displayName || undefined,
              photoURL: user.photoURL || undefined,
              email: user.email,
            }
          );
          console.log('Profile created successfully');
        }
      } catch (err) {
        console.error('Failed to initialize profile:', err);
        // Don't throw - initialization failure shouldn't break the app
      }
    }

    initProfile();
  }, [user]);
}
