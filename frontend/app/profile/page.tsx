'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';
import { getUserStats, UserStats } from '@/lib/completions';
import { getFavorites } from '@/lib/favorites';
import { getUserPreferences } from '@/lib/preferences';
import { getProfileByUid } from '@/lib/profileService';
import { UserProfile } from '@/lib/profileTypes';
import AuthButton from '@/components/AuthButton';
import Navbar from '@/components/Navbar';

type SectionId = 'overview' | 'personal_info' | 'achievements' | 'preferences' | 'stats';

interface Section {
  id: SectionId;
  label: string;
  render: () => React.ReactNode;
}

function ProfilePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [preferences, setPreferences] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [activeSection, setActiveSection] = useState<SectionId>('overview');

  // Check if we're in "section-only" mode (came from dropdown menu)
  const sectionFromQuery = searchParams?.get('section') as SectionId | null;
  const isSectionMode = sectionFromQuery !== null;

  useEffect(() => {
    if (!user) {
      setLoadingData(false);
      return;
    }

    // Set active section from query params if provided
    if (sectionFromQuery) {
      setActiveSection(sectionFromQuery);
    }

    loadUserData();
  }, [user, sectionFromQuery]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      setLoadingData(true);
      const [userStats, favorites, prefs, profile] = await Promise.all([
        getUserStats(user.uid),
        getFavorites(user.uid),
        getUserPreferences(user.uid),
        getProfileByUid(user.uid),
      ]);

      setStats(userStats);
      setFavoritesCount(favorites.length);
      setPreferences(prefs);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const renderOverviewSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
          <div className="text-center">
            <div className="text-4xl font-bold text-[#4A295F]">
              {stats?.total_xp || 0}
            </div>
            <div className="text-sm text-gray-600 mt-1">Total XP</div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
          <div className="text-center">
            <div className="text-4xl font-bold text-[#4A295F]">
              {stats?.total_quests_completed || 0}
            </div>
            <div className="text-sm text-gray-600 mt-1">Quests Completed</div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
          <div className="text-center">
            <div className="text-4xl font-bold text-[#4A295F]">
              {favoritesCount}
            </div>
            <div className="text-sm text-gray-600 mt-1">Favorites</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => router.push('/favorites')}
          className="px-6 py-4 bg-[#4A295F] text-white rounded-lg hover:bg-purple-900 transition font-medium cursor-pointer"
        >
          View Favorites
        </button>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-4 bg-purple-100 text-[#4A295F] rounded-lg hover:bg-purple-200 transition font-medium cursor-pointer"
        >
          Discover Quests
        </button>
      </div>

      {/* Edit Profile Button in Overview */}
      <button
        onClick={() => router.push('/profile/edit')}
        className="w-full px-6 py-3 border-2 border-[#4A295F] text-[#4A295F] rounded-lg hover:bg-purple-50 transition font-medium cursor-pointer flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
        Edit Full Profile
      </button>

      {stats?.last_completed && (
        <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
          <div className="text-sm text-gray-600 mb-1">Last Quest Completed</div>
          <div className="text-lg font-semibold text-[#4A295F]">
            {new Date(stats.last_completed).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </div>
      )}

      {!stats?.total_quests_completed && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-8 text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-[#4A295F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-bold text-[#4A295F] mb-2">
            Start Your Adventure!
          </h3>
          <p className="text-gray-600 mb-4">
            You haven't completed any quests yet. Start exploring to earn XP and unlock achievements!
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-[#4A295F] text-white rounded-lg hover:bg-purple-900 transition font-medium cursor-pointer"
          >
            Discover Quests
          </button>
        </div>
      )}
    </div>
  );

  const renderPersonalInfoSection = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Your Details</h3>
        <button
          onClick={() => router.push('/profile/edit')}
          className="px-4 py-2 bg-purple-100 text-[#4A295F] rounded-lg hover:bg-purple-200 transition text-sm font-medium"
        >
          Edit Profile
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            {userProfile?.profile?.photoURL || user?.photoURL ? (
              <img
                src={userProfile?.profile?.photoURL || user?.photoURL || ''}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover border-4 border-purple-50"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-[#4A295F] flex items-center justify-center text-white text-3xl font-bold">
                {user?.displayName?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <div>
              <h4 className="text-xl font-bold text-gray-900">{userProfile?.profile?.legalName || user?.displayName || 'Adventurer'}</h4>
              <p className="text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>

        <dl className="divide-y divide-gray-100">
          <div className="px-6 py-4 grid grid-cols-3 gap-4 hover:bg-gray-50 transition">
            <dt className="text-sm font-medium text-gray-500">Legal Name</dt>
            <dd className="text-sm text-gray-900 col-span-2">{userProfile?.profile?.legalName || 'Not set'}</dd>
          </div>
          <div className="px-6 py-4 grid grid-cols-3 gap-4 hover:bg-gray-50 transition">
            <dt className="text-sm font-medium text-gray-500">Preferred Name</dt>
            <dd className="text-sm text-gray-900 col-span-2">{userProfile?.profile?.preferredName || 'Not set'}</dd>
          </div>
          <div className="px-6 py-4 grid grid-cols-3 gap-4 hover:bg-gray-50 transition">
            <dt className="text-sm font-medium text-gray-500">About Me</dt>
            <dd className="text-sm text-gray-900 col-span-2">{userProfile?.profile?.aboutMe || 'No bio yet'}</dd>
          </div>
          <div className="px-6 py-4 grid grid-cols-3 gap-4 hover:bg-gray-50 transition">
            <dt className="text-sm font-medium text-gray-500">Location</dt>
            <dd className="text-sm text-gray-900 col-span-2">{userProfile?.lifestyle?.location || 'Not set'}</dd>
          </div>
          <div className="px-6 py-4 grid grid-cols-3 gap-4 hover:bg-gray-50 transition">
            <dt className="text-sm font-medium text-gray-500">Education</dt>
            <dd className="text-sm text-gray-900 col-span-2">{userProfile?.lifestyle?.education || 'Not set'}</dd>
          </div>
          <div className="px-6 py-4 grid grid-cols-3 gap-4 hover:bg-gray-50 transition">
            <dt className="text-sm font-medium text-gray-500">Work</dt>
            <dd className="text-sm text-gray-900 col-span-2">{userProfile?.lifestyle?.work || 'Not set'}</dd>
          </div>
        </dl>
      </div>

      <div className="bg-purple-50 rounded-lg p-6 border border-purple-200 mt-6">
        <h4 className="font-semibold text-[#4A295F] mb-4">Lifestyle & Vibes</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Quest Vibe</p>
            <div className="flex flex-wrap gap-2">
              {userProfile?.lifestyle?.questVibe?.length ? (
                userProfile.lifestyle.questVibe.map((v) => (
                  <span key={v} className="px-2 py-1 bg-white text-[#4A295F] text-xs rounded border border-purple-100 capitalize">
                    {v}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-400">Not set</span>
              )}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Budget Comfort</p>
            <div className="text-sm text-gray-700 capitalize">
              {userProfile?.lifestyle?.budgetComfort || 'Moderate'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAchievementsSection = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <div className={`p-6 rounded-lg border-2 text-center transition ${(stats?.total_quests_completed || 0) >= 1
        ? 'bg-yellow-50 border-yellow-400 scale-105'
        : 'bg-gray-100 border-gray-300 opacity-50'
        }`}>
        <svg className="w-12 h-12 mx-auto mb-3" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <div className="font-semibold mb-1">First Quest</div>
        <div className="text-xs text-gray-600">Complete 1 quest</div>
      </div>

      <div className={`p-6 rounded-lg border-2 text-center transition ${(stats?.total_quests_completed || 0) >= 5
        ? 'bg-yellow-50 border-yellow-400 scale-105'
        : 'bg-gray-100 border-gray-300 opacity-50'
        }`}>
        <svg className="w-12 h-12 mx-auto mb-3" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
          <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
          <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
        </svg>
        <div className="font-semibold mb-1">Explorer</div>
        <div className="text-xs text-gray-600">Complete 5 quests</div>
      </div>

      <div className={`p-6 rounded-lg border-2 text-center transition ${(stats?.total_quests_completed || 0) >= 10
        ? 'bg-yellow-50 border-yellow-400 scale-105'
        : 'bg-gray-100 border-gray-300 opacity-50'
        }`}>
        <svg className="w-12 h-12 mx-auto mb-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
        </svg>
        <div className="font-semibold mb-1">Adventurer</div>
        <div className="text-xs text-gray-600">Complete 10 quests</div>
      </div>

      <div className={`p-6 rounded-lg border-2 text-center transition ${(stats?.total_xp || 0) >= 500
        ? 'bg-yellow-50 border-yellow-400 scale-105'
        : 'bg-gray-100 border-gray-300 opacity-50'
        }`}>
        <svg className="w-12 h-12 mx-auto mb-3" fill="currentColor" viewBox="0 0 20 20">
          <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
        </svg>
        <div className="font-semibold mb-1">XP Master</div>
        <div className="text-xs text-gray-600">Earn 500 XP</div>
      </div>

      <div className={`p-6 rounded-lg border-2 text-center transition ${favoritesCount >= 5
        ? 'bg-yellow-50 border-yellow-400 scale-105'
        : 'bg-gray-100 border-gray-300 opacity-50'
        }`}>
        <svg className="w-12 h-12 mx-auto mb-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
        </svg>
        <div className="font-semibold mb-1">Collector</div>
        <div className="text-xs text-gray-600">Save 5 favorites</div>
      </div>

      <div className={`p-6 rounded-lg border-2 text-center transition ${(stats?.total_quests_completed || 0) >= 20
        ? 'bg-yellow-50 border-yellow-400 scale-105'
        : 'bg-gray-100 border-gray-300 opacity-50'
        }`}>
        <svg className="w-12 h-12 mx-auto mb-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
        </svg>
        <div className="font-semibold mb-1">Legend</div>
        <div className="text-xs text-gray-600">Complete 20 quests</div>
      </div>
    </div>
  );



  const renderPreferencesSection = () => (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={() => router.push('/onboarding?mode=edit')} className="px-4 py-2 bg-[#4A295F] text-white rounded hover:bg-purple-900 transition">Edit Preferences</button>
      </div>
      {preferences ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {preferences.radius && (
            <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
              <div className="text-sm font-semibold text-gray-600 mb-2">
                Search Radius
              </div>
              <div className="text-xl font-bold text-[#4A295F]">
                {`${preferences.radius[0]} - ${preferences.radius[1]} km`}
              </div>
            </div>
          )}

          {preferences.categories && preferences.categories.length > 0 && (
            <div className="md:col-span-2 bg-purple-50 rounded-lg p-6 border border-purple-200">
              <div className="text-sm font-semibold text-gray-600 mb-3">
                Favorite Categories
              </div>
              <div className="flex flex-wrap gap-2">
                {preferences.categories.map((cat: string) => (
                  <span
                    key={cat}
                    className="px-3 py-1 bg-[#4A295F] text-white rounded-full text-sm font-medium"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}
          {preferences.sortBy && (
            <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
              <div className="text-sm font-semibold text-gray-600 mb-2">Default Sort</div>
              <div className="text-xl font-bold text-[#4A295F]">{preferences.sortBy}</div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-8 text-center">
          <p className="text-gray-600">
            You haven't set any preferences yet. Start exploring to automatically save your preferences!
          </p>
        </div>
      )}
    </div>
  );

  const renderStatsSection = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
        <div className="text-sm text-gray-600 mb-2">Total XP</div>
        <div className="text-3xl font-bold text-[#4A295F]">
          {stats?.total_xp || 0}
        </div>
      </div>
      <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
        <div className="text-sm text-gray-600 mb-2">Quests Completed</div>
        <div className="text-3xl font-bold text-[#4A295F]">
          {stats?.total_quests_completed || 0}
        </div>
      </div>
      <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
        <div className="text-sm text-gray-600 mb-2">Favorites</div>
        <div className="text-3xl font-bold text-[#4A295F]">
          {favoritesCount}
        </div>
      </div>
    </div>
  );

  const sections: Section[] = [
    { id: 'overview', label: 'Overview', render: renderOverviewSection },
    { id: 'personal_info', label: 'Personal Info', render: renderPersonalInfoSection },
    { id: 'achievements', label: 'Achievements', render: renderAchievementsSection },
    { id: 'preferences', label: 'Preferences', render: renderPreferencesSection },
    { id: 'stats', label: 'Stats', render: renderStatsSection },
  ];

  const activeSection_obj = sections.find((s) => s.id === activeSection);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#4A295F] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {user ? (
          <div>
            {/* User Info Header */}
            <div className="text-center mb-12">
              <div className="mb-6 flex justify-center">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-24 h-24 rounded-full border-4 border-[#4A295F]"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-[#4A295F] flex items-center justify-center text-white text-4xl font-bold">
                    {user.displayName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              <h2 className="section-title text-[#4A295F]">
                {user.displayName || 'Adventurer'}
              </h2>
              <p className="text-sm subtitle" style={{ fontWeight: 500, color: '#000000' }}>{user.email}</p>
            </div>

            {loadingData ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#4A295F] mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading your profile...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left Sidebar - Navigation */}
                <div className="lg:col-span-1">
                  <div className="sticky top-24 bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <nav className="space-y-2">
                      {sections.map((section) => (
                        <button
                          key={section.id}
                          onClick={() => setActiveSection(section.id)}
                          className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all border-l-4 cursor-pointer ${activeSection === section.id
                            ? 'bg-purple-50 border-l-[#4A295F] text-[#4A295F]'
                            : 'border-l-transparent text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                          {section.label}
                        </button>
                      ))}
                    </nav>
                  </div>
                </div>

                {/* Right Content Panel */}
                <div className="lg:col-span-3">
                  <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
                    {activeSection_obj && (
                      <>
                        <h2 className="section-title text-[#4A295F] mb-6">
                          {activeSection_obj.label}
                        </h2>
                        {activeSection_obj.render()}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <div className="bg-white rounded-lg border border-gray-200 p-12 max-w-2xl mx-auto shadow-sm">
              <h1 className="page-title text-[#4A295F] text-center">
                Sign in to view your profile
              </h1>
              <p className="text-lg subtitle mt-4" style={{ fontWeight: 500, color: '#000000' }}>
                Track your quest completions, XP, and achievements
              </p>
              <AuthButton />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-center"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#4A295F] mx-auto"></div></div></div>}>
      <ProfilePageContent />
    </Suspense>
  );
}
