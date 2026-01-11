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
      <nav className="bg-white border-b border-gray-200" style={{ borderBottomColor: 'rgba(0,0,0,0.08)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-3 items-center h-20 gap-4">
            {/* Left: Logo */}
            <div>
              <button
                onClick={() => router.push('/')}
                className="text-2xl text-[#4A295F] hover:text-purple-900 transition cursor-pointer"
                style={{ fontWeight: 800, fontFamily: 'var(--font-inter)', letterSpacing: '-0.03em', lineHeight: 1 }}
              >
                SideQuest
              </button>
            </div>

            {/* Center: Nav Links */}
            {user && (
              <div className="flex justify-center gap-8">
                <button
                  onClick={() => router.push('/')}
                  className="text-gray-700 hover:text-gray-900 transition text-sm font-semibold cursor-pointer border-b-2 border-transparent hover:border-gray-900"
                  style={{ fontWeight: 600, fontSize: '15px', fontFamily: 'var(--font-inter)', letterSpacing: 'normal', lineHeight: '1' }}
                >
                  Home
                </button>
                <button
                  onClick={() => router.push('/favorites')}
                  className="text-gray-700 hover:text-gray-900 transition text-sm font-semibold cursor-pointer border-b-2 border-transparent hover:border-gray-900"
                  style={{ fontWeight: 600, fontSize: '15px', fontFamily: 'var(--font-inter)', letterSpacing: 'normal', lineHeight: '1' }}
                >
                  Favorites
                </button>
                <button
                  onClick={() => router.push('/friends')}
                  className="text-gray-700 hover:text-gray-900 transition text-sm font-semibold cursor-pointer border-b-2 border-transparent hover:border-gray-900"
                  style={{ fontWeight: 600, fontSize: '15px', fontFamily: 'var(--font-inter)', letterSpacing: 'normal', lineHeight: '1' }}
                >
                  Friends
                </button>
                <button
                  onClick={() => router.push('/profile')}
                  className="text-gray-700 hover:text-gray-900 transition text-sm font-semibold cursor-pointer border-b-2 border-transparent hover:border-gray-900"
                  style={{ fontWeight: 600, fontSize: '15px', fontFamily: 'var(--font-inter)', letterSpacing: 'normal', lineHeight: '1' }}
                >
                  Profile
                </button>
              </div>
            )}

            {/* Right: Auth Actions */}
            <div className="flex justify-end">
              <AuthButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {user ? (
          <div>
            <div className="mb-8">
              <h1 className="page-title text-[#4A295F]">
                My Favorites
              </h1>
              <p className="text-lg subtitle" style={{ fontWeight: 500, color: '#4B5563' }}>
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
                  className="px-6 py-3 bg-[#4A295F] text-white rounded-lg hover:bg-purple-900 transition cursor-pointer"
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
                      <div className="w-full h-48 bg-gray-200 overflow-hidden">
                        <img
                          src={(() => {
                            // Priority 1: Use tag-based themed image
                            const tag = quest.tags[0]?.toLowerCase() || '';
                            const tagImageMap: Record<string, string> = {
                              'coffee': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=400&h=300',
                              'food': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&h=300',
                              'restaurant': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&h=300',
                              'park': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=400&h=300',
                              'nature': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=400&h=300',
                              'art': 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=400&h=300',
                              'museum': 'https://images.unsplash.com/photo-1554907984-15263bfd63bd?auto=format&fit=crop&w=400&h=300',
                              'shopping': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&h=300',
                              'bar': 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=400&h=300',
                              'nightlife': 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=400&h=300',
                              'entertainment': 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=400&h=300',
                              'music': 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=400&h=300',
                              'sports': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=400&h=300',
                              'fitness': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=400&h=300',
                              'cafe': 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=400&h=300',
                              'bakery': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&h=300',
                              'beach': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&h=300',
                              'hiking': 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=400&h=300',
                              'adventure': 'https://images.unsplash.com/photo-1533130061792-64b345e4a833?auto=format&fit=crop&w=400&h=300',
                            };

                            // Check if we have a matching tag image
                            for (const [key, url] of Object.entries(tagImageMap)) {
                              if (tag.includes(key) || quest.title.toLowerCase().includes(key)) {
                                return url;
                              }
                            }

                            // Fallback to themed random image based on quest_id hash
                            const questHash = quest.quest_id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                            const imageIndex = questHash % 20;
                            const fallbackImages = [
                              'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=400&h=300',
                              'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=400&h=300',
                              'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=400&h=300',
                              'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=400&h=300',
                              'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=400&h=300',
                              'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=400&h=300',
                              'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&h=300',
                              'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=400&h=300',
                              'https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=400&h=300',
                              'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=400&h=300',
                              'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=400&h=300',
                              'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=400&h=300',
                              'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=400&h=300',
                              'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=400&h=300',
                              'https://images.unsplash.com/photo-1478860409698-8707f313ee8b?auto=format&fit=crop&w=400&h=300',
                              'https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?auto=format&fit=crop&w=400&h=300',
                              'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=400&h=300',
                              'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?auto=format&fit=crop&w=400&h=300',
                              'https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?auto=format&fit=crop&w=400&h=300',
                              'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=400&h=300',
                            ];
                            return fallbackImages[imageIndex];
                          })()}
                          alt={quest.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=400&h=300';
                          }}
                        />
                      </div>

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
                            className="flex-1 px-4 py-2 bg-[#4A295F] text-white rounded-lg hover:bg-purple-900 transition text-sm font-medium cursor-pointer"
                          >
                            View Quest
                          </button>
                          <button
                            onClick={() => handleRemoveFavorite(favorite.item_id)}
                            disabled={removingId === favorite.item_id}
                            className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition text-sm font-medium disabled:opacity-50 cursor-pointer"
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
