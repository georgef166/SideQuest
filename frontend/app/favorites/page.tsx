'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';
import { getFavorites, removeFromFavorites, Favorite } from '@/lib/favorites';
import AuthButton from '@/components/AuthButton';

export default function FavoritesPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoadingFavorites(false);
      return;
    }

    loadFavorites();
  }, [user]);

  const loadFavorites = async () => {
    if (!user) return;

    try {
      setLoadingFavorites(true);
      const userFavorites = await getFavorites(user.uid);
      setFavorites(userFavorites);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoadingFavorites(false);
    }
  };

  const handleRemoveFavorite = async (itemId: string) => {
    if (!user) return;

    try {
      setRemovingId(itemId);
      await removeFromFavorites(user.uid, itemId);
      setFavorites(favorites.filter(fav => fav.item_id !== itemId));
    } catch (error) {
      console.error('Error removing favorite:', error);
      alert('Failed to remove favorite');
    } finally {
      setRemovingId(null);
    }
  };

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
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="text-2xl font-bold text-[#4A295F] hover:text-purple-900 transition"
              >
                SideQuest
              </button>
              {user && (
                <button
                  onClick={() => router.push('/profile')}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition font-medium text-sm"
                >
                  Profile
                </button>
              )}
            </div>
            <AuthButton />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {user ? (
          <div>
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-[#4A295F] mb-2">
                My Favorites
              </h1>
              <p className="text-gray-600 text-lg">
                Your saved quests and places
              </p>
            </div>

            {loadingFavorites ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#4A295F] mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading your favorites...</p>
              </div>
            ) : favorites.length === 0 ? (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-12 text-center">
                <svg className="w-20 h-20 mx-auto mb-6 text-[#4A295F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <h2 className="text-2xl font-bold text-[#4A295F] mb-2">
                  No favorites yet
                </h2>
                <p className="text-gray-600 mb-6">
                  Start exploring and save your favorite quests!
                </p>
                <button
                  onClick={() => router.push('/')}
                  className="px-6 py-3 bg-[#4A295F] text-white rounded-lg hover:bg-purple-900 transition"
                >
                  Discover Quests
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((favorite) => {
                  const quest = favorite.quest_data;
                  if (!quest) return null;

                  return (
                    <div
                      key={favorite.item_id}
                      className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-200"
                    >
                      <div className="w-full h-48 bg-gradient-to-br from-purple-400 to-indigo-500"></div>
                      
                      <div className="p-5">
                        <h3 className="text-lg font-bold text-[#4A295F] mb-2">
                          {quest.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {quest.description}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {quest.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="inline-block px-3 py-1 bg-purple-100 text-[#4A295F] text-xs font-medium rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div className="flex justify-between items-center text-sm text-gray-600 border-t border-gray-100 pt-3 mb-3">
                          <div className="flex gap-4">
                            <span>⏱️ {quest.estimated_time}min</span>
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              ${Math.round(quest.estimated_cost)}
                            </span>
                          </div>
                        </div>

                        {favorite.notes && (
                          <div className="mb-3 p-2 bg-yellow-50 rounded text-xs text-gray-700">
                            📝 {favorite.notes}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              // Save quest to localStorage before navigating
                              const storedQuests = localStorage.getItem('currentQuests');
                              let quests = storedQuests ? JSON.parse(storedQuests) : [];
                              
                              // Add this quest if it's not already there
                              if (!quests.find((q: any) => q.quest_id === quest.quest_id)) {
                                quests.push(quest);
                                localStorage.setItem('currentQuests', JSON.stringify(quests));
                              }
                              
                              router.push(`/quest/${quest.quest_id}`);
                            }}
                            className="flex-1 px-4 py-2 bg-[#4A295F] text-white rounded-lg hover:bg-purple-900 transition text-sm font-medium"
                          >
                            View Quest
                          </button>
                          <button
                            onClick={() => handleRemoveFavorite(favorite.item_id)}
                            disabled={removingId === favorite.item_id}
                            className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition text-sm font-medium disabled:opacity-50"
                          >
                            {removingId === favorite.item_id ? '...' : '🗑️'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <div className="bg-white rounded-lg border border-gray-200 p-12 max-w-2xl mx-auto shadow-sm">
              <h1 className="text-4xl font-bold text-[#4A295F] mb-4">
                Sign in to view favorites
              </h1>
              <p className="text-gray-600 mb-6">
                Save your favorite quests and access them anytime
              </p>
              <AuthButton />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
