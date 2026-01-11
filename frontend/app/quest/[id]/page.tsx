'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Quest } from '@/lib/types';
import { useAuth } from '@/lib/useAuth';
import { completeQuest } from '@/lib/completions';
import { addToFavorites, removeFromFavorites, getFavorites } from '@/lib/favorites';
import { useToast } from '@/lib/toast';
import LocationDisplay from '@/components/LocationDisplay';

export default function QuestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const questId = params.id as string;

  const [quest, setQuest] = useState<Quest | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [togglingFavorite, setTogglingFavorite] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  useEffect(() => {
    // For now, we'll retrieve the quest from localStorage
    // In a real app, you'd fetch it from the API
    const storedQuests = localStorage.getItem('currentQuests');
    if (storedQuests) {
      const quests: Quest[] = JSON.parse(storedQuests);
      const foundQuest = quests.find(q => q.quest_id === questId);
      setQuest(foundQuest || null);
    }
    setLoading(false);

    // Check if favorited
    if (user) {
      checkFavoriteStatus();
    }
  }, [questId, user]);

  const checkFavoriteStatus = async () => {
    if (!user) return;
    try {
      const favorites = await getFavorites(user.uid);
      setIsFavorite(favorites.some(fav => fav.item_id === questId));
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!user || !quest) {
      showToast('Please sign in to save favorites', 'warning');
      return;
    }

    try {
      setTogglingFavorite(true);
      if (isFavorite) {
        await removeFromFavorites(user.uid, questId);
        setIsFavorite(false);
        showToast('Removed from favorites', 'success');
      } else {
        await addToFavorites(user.uid, questId, 'quest', quest);
        setIsFavorite(true);
        showToast('Added to favorites!', 'success');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      showToast('Failed to update favorite', 'error');
    } finally {
      setTogglingFavorite(false);
    }
  };

  const handleCompleteQuest = async () => {
    if (!user || !quest) {
      showToast('Please sign in to complete quests', 'warning');
      return;
    }

    setShowRating(true);
  };

  const submitCompletion = async () => {
    if (!user || !quest) return;

    try {
      setCompleting(true);
      const result = await completeQuest(user.uid, quest.quest_id, quest.title, rating || undefined, feedback || undefined);
      showToast(`Quest completed! You earned ${result.xp_earned} XP!`, 'success');
      setShowRating(false);
      router.push('/profile');
    } catch (error) {
      console.error('Error completing quest:', error);
      showToast('Failed to complete quest', 'error');
    } finally {
      setCompleting(false);
    }
  };

  const handleShare = (method: string) => {
    if (!quest) return;

    const shareUrl = `${window.location.origin}/quest/${quest.quest_id}`;
    const shareText = `Check out this quest: ${quest.title} - ${quest.description}`;

    switch (method) {
      case 'copy':
        navigator.clipboard.writeText(shareUrl);
        showToast('Link copied to clipboard!', 'success');
        break;
      case 'sms':
        window.open(`sms:?&body=${encodeURIComponent(shareText + ' ' + shareUrl)}`);
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`);
        break;
    }
    setShowShareMenu(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#4A295F] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading quest...</p>
        </div>
      </div>
    );
  }

  if (!quest) {
    return (
      <div className="min-h-screen bg-white">
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <button
                onClick={() => router.push('/')}
                className="text-2xl font-bold text-[#4A295F] hover:text-purple-900 transition"
              >
                SideQuest
              </button>
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 bg-[#4A295F] text-white rounded-lg hover:bg-purple-900 transition font-medium"
              >
                ← Back Home
              </button>
            </div>
          </div>
        </nav>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow-lg p-12 text-center border border-gray-200">
            <div className="mb-6">
              <svg className="w-20 h-20 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Quest Not Found</h2>
            <p className="text-gray-600 mb-6">This quest doesn't exist or has expired.</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-[#4A295F] text-white rounded-lg hover:bg-purple-900 transition font-medium"
            >
              Find New Quests
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalTime = quest.estimated_time;
  const totalCost = quest.estimated_cost;

  const handleViewOnMap = () => {
    if (!quest || !quest.steps.length) return;

    // Construct Google Maps URL with waypoints
    const origin = 'Current Location';
    const destination = `${quest.steps[quest.steps.length - 1].location.lat},${quest.steps[quest.steps.length - 1].location.lng}`;

    let waypoints = '';
    if (quest.steps.length > 1) {
      const intermediateSteps = quest.steps.slice(0, -1);
      waypoints = '&waypoints=' + intermediateSteps.map(step => `${step.location.lat},${step.location.lng}`).join('|');
    }

    const mapUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${destination}${waypoints}`;
    window.open(mapUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => router.push('/')}
              className="text-2xl font-bold text-[#4A295F] hover:text-purple-900 transition"
            >
              SideQuest
            </button>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-[#4A295F] text-white rounded-lg hover:bg-purple-900 transition font-medium"
            >
              ← Back to Quests
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quest Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6 border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-bold text-[#4A295F] mb-2">{quest.title}</h1>
              <p className="text-xl text-gray-600">{quest.description}</p>
            </div>
            <span className="px-4 py-2 bg-purple-100 text-[#4A295F] rounded-full font-semibold">
              {quest.category}
            </span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {quest.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-purple-100 text-[#4A295F] rounded-full text-sm font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Quest Stats */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{totalTime} min</div>
              <div className="text-sm text-gray-600">Total Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">${totalCost.toFixed(0)}</div>
              <div className="text-sm text-gray-600">Estimated Cost</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-800 capitalize">
                {quest.difficulty.replace('_', ' ')}
              </div>
              <div className="text-sm text-gray-600">Energy Level</div>
            </div>
          </div>

          {/* Best Time */}
          {quest.best_time && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Best Time:</strong> {quest.best_time}
              </p>
            </div>
          )}
        </div>

        {/* Quest Steps */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-[#4A295F] mb-6">Your Adventure Steps</h2>

          <div className="space-y-6">
            {quest.steps.map((step, index) => (
              <div key={step.order} className="flex gap-4">
                {/* Step Number */}
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-[#4A295F] text-white rounded-full flex items-center justify-center font-bold text-lg">
                    {step.order}
                  </div>
                  {index < quest.steps.length - 1 && (
                    <div className="w-0.5 h-16 bg-purple-200 mx-auto mt-2"></div>
                  )}
                </div>

                {/* Step Content */}
                <div className="flex-grow pb-6">
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-[#4A295F] uppercase">
                        {step.type}
                      </span>
                      {step.estimated_time && (
                        <span className="text-sm text-gray-500">
                          • {step.estimated_time} min
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-[#4A295F] mb-2">{step.name}</h3>
                    {step.description && (
                      <p className="text-gray-600 mb-3">{step.description}</p>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="flex-1">
                        <LocationDisplay lat={step.location.lat} lng={step.location.lng} />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-lg p-6 relative">
          <div className="flex gap-4">
            <button
              onClick={handleCompleteQuest}
              disabled={!user}
              className="flex-1 px-6 py-4 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Complete Quest
            </button>
            <button
              onClick={toggleFavorite}
              disabled={togglingFavorite || !user}
              className="flex-1 px-6 py-4 bg-[#4A295F] text-white font-bold rounded-lg hover:bg-purple-900 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill={isFavorite ? 'white' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {isFavorite ? 'Saved to Favorites' : 'Save to Favorites'}
            </button>
            <div className="relative flex-1">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="w-full h-full px-6 bg-purple-500 text-white font-bold rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share
              </button>

              {/* Share Menu - Absolute Positioned Popover */}
              {showShareMenu && (
                <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-10">
                  <button onClick={() => handleShare('copy')} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 text-sm font-medium transition-colors">
                    Copy Link
                  </button>
                  <button onClick={() => handleShare('sms')} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 text-sm font-medium transition-colors">
                    Send via SMS
                  </button>
                  <button onClick={() => handleShare('whatsapp')} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 text-sm font-medium transition-colors">
                    WhatsApp
                  </button>
                  <button onClick={() => handleShare('twitter')} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 text-sm font-medium transition-colors">
                    Twitter
                  </button>
                </div>
              )}
            </div>
          </div>

          {!user && (
            <p className="mt-3 text-sm text-gray-500 text-center">
              Sign in to save favorites and track completions
            </p>
          )}

          {/* Rating Modal - High Blur, No Dark Overlay */}
          {showRating && (
            <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowRating(false)}>
              <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border border-gray-100" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-2xl font-bold text-[#4A295F] mb-4 text-center">Rate Your Adventure</h3>

                <div className="mb-6 text-center">
                  <div className="flex gap-3 justify-center mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="hover:scale-110 transition-transform focus:outline-none"
                      >
                        <svg
                          className={`w-12 h-12 transition-colors ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
                          fill={star <= rating ? 'currentColor' : 'none'}
                          stroke="currentColor"
                          strokeWidth="1.5"
                          viewBox="0 0 24 24"
                        >
                          <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                  <p className="text-sm font-medium text-gray-500">
                    {rating === 0 ? 'Tap to rate' : rating === 5 ? 'Amazing!' : rating >= 4 ? 'Great!' : 'Thanks for rating!'}
                  </p>
                </div>

                <div className="mb-6">
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Any notes on your journey?"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 placeholder-gray-400 resize-none"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowRating(false)}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitCompletion}
                    disabled={completing || rating === 0}
                    className="flex-1 px-4 py-3 bg-[#4A295F] text-white font-bold rounded-xl hover:bg-purple-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-200"
                  >
                    {completing ? 'Saving...' : 'Complete!'}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 text-center border-t pt-6">
            <button
              onClick={handleViewOnMap}
              className="text-[#4A295F] hover:text-purple-900 font-semibold text-lg underline decoration-2 underline-offset-4 transition"
            >
              View on Map
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
