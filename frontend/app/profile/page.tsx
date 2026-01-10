'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/lib/useAuth';
import { getProfileByUid, getIncompleteFields } from '@/lib/profileService';
import { UserProfile } from '@/lib/profileTypes';
import {
  ProfileCard,
  SectionHeader,
  ProfileCompletionCard,
  EmptyState,
} from '@/components/ProfileCard';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (date: any) => {
    if (!date) return '';
    const d = new Date(date.seconds ? date.seconds * 1000 : date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/');
      return;
    }

    loadProfile();
  }, [user, authLoading, router]);

  async function loadProfile() {
    try {
      setLoading(true);
      const data = await getProfileByUid(user!.uid);
      if (data) {
        setProfile(data);
      } else {
        // Profile doesn't exist - create one
        console.log('No profile found, creating new one');
        const newProfile = await getProfileByUid(user!.uid);
        if (newProfile) {
          setProfile(newProfile);
        } else {
          setError('Could not create profile. Please try again.');
        }
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError('Failed to load profile: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <EmptyState
            title="Could not load profile"
            description={error || 'Your profile data could not be loaded properly.'}
            action={{
              label: 'Go back home',
              onClick: () => router.push('/'),
            }}
          />
        </div>
      </div>
    );
  }

  // Ensure all nested objects exist with defaults
  const safeProfile: UserProfile = {
    ...profile,
    profile: profile.profile || {
      legalName: '',
      updatedAt: profile.createdAt || new Date(),
    },
    lifestyle: profile.lifestyle || {
      questVibe: [],
      budgetComfort: 'moderate',
      updatedAt: profile.createdAt || new Date(),
    },
    preferences: profile.preferences || {
      updatedAt: profile.createdAt || new Date(),
    },
    stats: profile.stats || {
      questsCompleted: 0,
      currentStreak: 0,
      favoritesCount: 0,
      profileCompletionPercentage: 0,
    },
  };

  if (!safeProfile.profile || !safeProfile.lifestyle || !safeProfile.preferences) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <EmptyState
            title="Invalid profile data"
            description="Your profile data structure is invalid. Please contact support."
            action={{
              label: 'Go back home',
              onClick: () => router.push('/'),
            }}
          />
        </div>
      </div>
    );
  }

  const incompleteFields = getIncompleteFields({
    profile: {
      legalName: safeProfile.profile?.legalName,
      aboutMe: safeProfile.profile?.aboutMe,
      photoURL: safeProfile.profile?.photoURL,
    },
    lifestyle: {
      location: safeProfile.lifestyle?.location,
      questVibe: safeProfile.lifestyle?.questVibe,
      budgetComfort: safeProfile.lifestyle?.budgetComfort,
    },
    preferences: {
      favoriteCategories: safeProfile.preferences?.favoriteCategories,
      accessibilityNeeds: safeProfile.preferences?.accessibilityNeeds,
    },
  });

  const completionPercentage = safeProfile?.stats?.profileCompletionPercentage || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            Back
          </button>
          <h1 className="text-lg font-semibold text-gray-900">My Profile</h1>
          <button
            onClick={() => router.push('/profile/edit')}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            Edit Profile
          </button>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Avatar and Name Section */}
        <div className="text-center mb-12">
          <div className="mb-6 flex justify-center">
            {safeProfile?.photoURL ? (
              <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-200">
                <Image
                  src={safeProfile.photoURL}
                  alt={safeProfile.displayName || 'User'}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-4xl font-bold">
                {safeProfile?.displayName?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{safeProfile?.displayName || 'User'}</h2>
          {safeProfile?.profile?.preferredName && safeProfile.profile.preferredName !== safeProfile.displayName && (
            <p className="text-sm text-gray-500 mb-4">@{safeProfile.profile.preferredName}</p>
          )}
          <p className="text-sm text-gray-600">
            Joined {formatDate(safeProfile?.createdAt)}
          </p>
        </div>

        {/* Profile Completeness Card */}
        <ProfileCompletionCard
          percentage={completionPercentage}
          incompleteFields={incompleteFields}
        />

        {/* About You Section */}
        <SectionHeader title="About You">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ProfileCard
              icon="U"
              label="Legal Name"
              value={safeProfile.profile?.legalName}
            />
            <ProfileCard
              icon="N"
              label="Preferred Name"
              value={safeProfile.profile?.preferredName}
              emptyText="Not set"
            />
            <div className="md:col-span-2">
              <ProfileCard
                icon="I"
                label="About Me"
                value={safeProfile.profile?.aboutMe}
                emptyText="Add your intro"
              />
            </div>
            <div className="md:col-span-2">
              <ProfileCard
                icon="E"
                label="Email"
                value={safeProfile.email}
              />
            </div>
          </div>
        </SectionHeader>

        {/* My Lifestyle Section */}
        <SectionHeader title="My Lifestyle">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ProfileCard
              icon="L"
              label="Where I Live"
              value={safeProfile.lifestyle?.location}
              emptyText="Not specified"
            />
            <ProfileCard
              icon="S"
              label="Education"
              value={safeProfile.lifestyle?.education}
              emptyText="Not specified"
            />
            <ProfileCard
              icon="W"
              label="My Work"
              value={safeProfile.lifestyle?.work}
              emptyText="Not specified"
            />
            <ProfileCard
              icon="V"
              label="Quest Vibe"
              value={safeProfile.lifestyle?.questVibe}
              emptyText="Not specified"
            />
            <ProfileCard
              icon="B"
              label="Budget Comfort"
              value={
                safeProfile.lifestyle?.budgetComfort === 'broke'
                  ? 'Broke (budget conscious)'
                  : safeProfile.lifestyle?.budgetComfort === 'moderate'
                    ? 'Moderate'
                    : 'Bougie (spendable)'
              }
            />
            <ProfileCard
              icon="T"
              label="Transportation"
              value={safeProfile.lifestyle?.transportation}
              emptyText="Not specified"
            />
            <div className="md:col-span-2">
              <ProfileCard
                icon="D"
                label="Dietary Preferences"
                value={safeProfile.lifestyle?.dietaryPreferences}
                emptyText="Not specified"
              />
            </div>
          </div>
        </SectionHeader>

        {/* My Preferences Section */}
        <SectionHeader title="My Preferences">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ProfileCard
              icon="A"
              label="Accessibility Needs"
              value={safeProfile.preferences?.accessibilityNeeds}
              emptyText="None specified"
            />
            <ProfileCard
              icon="T"
              label="Time Preference"
              value={safeProfile.preferences?.timePreference}
              emptyText="Not specified"
            />
            <div className="md:col-span-2">
              <ProfileCard
                icon="C"
                label="Favorite Categories"
                value={safeProfile.preferences?.favoriteCategories}
                emptyText="Not specified"
              />
            </div>
            <ProfileCard
              icon="E"
              label="Energy Level"
              value={safeProfile.preferences?.energyLevel}
              emptyText="Not specified"
            />
            <ProfileCard
              icon="S"
              label="Social Comfort"
              value={safeProfile.preferences?.socialComfort}
              emptyText="Not specified"
            />
          </div>
        </SectionHeader>

        {/* Quest Stats Section */}
        <SectionHeader title="Quest Stats">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ProfileCard
              icon="Q"
              label="Quests Completed"
              value={safeProfile.stats?.questsCompleted?.toString() || '0'}
            />
            <ProfileCard
              icon="F"
              label="Current Streak"
              value={`${safeProfile.stats?.currentStreak || 0} days`}
            />
            <ProfileCard
              icon="X"
              label="Favorites"
              value={safeProfile.stats?.favoritesCount?.toString() || '0'}
            />
          </div>
        </SectionHeader>
      </main>
    </div>
  );
}
