'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';
import { getActiveQuests, ActiveQuestRecord, deactivateQuest } from '@/lib/activeQuests';
import { completeQuest } from '@/lib/completions';
import { useToast } from '@/lib/toast';
import QuestCard from '@/components/QuestCard';
import AuthButton from '@/components/AuthButton';
import Navbar from '@/components/Navbar';

export default function QuestsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { showToast } = useToast();
  const [activeQuests, setActiveQuests] = useState<ActiveQuestRecord[]>([]);
  const [loadingQuests, setLoadingQuests] = useState(true);
  const [showRating, setShowRating] = useState(false);
  const [selectedQuestId, setSelectedQuestId] = useState<string | null>(null);
  const [selectedQuestTitle, setSelectedQuestTitle] = useState<string>('');
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
      return;
    }

    if (user) {
      loadActiveQuests();
    }
  }, [user, loading, router]);

  const loadActiveQuests = async () => {
    if (!user) return;

    try {
      setLoadingQuests(true);
      const quests = await getActiveQuests(user.uid);
      setActiveQuests(quests);
    } catch (error) {
      console.error('Error loading active quests:', error);
      showToast('Failed to load active quests', 'error');
    } finally {
      setLoadingQuests(false);
    }
  };

  const handleQuestClick = (questId: string) => {
    router.push(`/quest/${questId}`);
  };

  const handleCompleteQuest = (questId: string, questTitle: string) => {
    setSelectedQuestId(questId);
    setSelectedQuestTitle(questTitle);
    setRating(0);
    setFeedback('');
    setShowRating(true);
  };

  const submitCompletion = async () => {
    if (!user || !selectedQuestId) return;

    try {
      setCompleting(true);
      const result = await completeQuest(user.uid, selectedQuestId, selectedQuestTitle, rating || undefined, feedback || undefined);

      // Deactivate the quest after completion
      try {
        await deactivateQuest(user.uid, selectedQuestId);
      } catch (error) {
        console.error('Error deactivating quest:', error);
      }

      showToast(`Quest completed! You earned ${result.xp_earned} XP!`, 'success');
      setShowRating(false);

      // Reload active quests
      await loadActiveQuests();
    } catch (error) {
      console.error('Error completing quest:', error);
      showToast('Failed to complete quest', 'error');
    } finally {
      setCompleting(false);
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

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-[#4A295F] mb-2">Active Quests</h1>
          <p className="text-lg text-black">Your adventures in progress</p>
        </div>

        {loadingQuests ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#4A295F] mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading your active quests...</p>
            </div>
          </div>
        ) : activeQuests.length === 0 ? (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-12 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-[#4A295F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m7 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-[#4A295F] mb-2">No Active Quests Yet</h2>
            <p className="text-gray-600 mb-6">Start an adventure by discovering and activating quests!</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-[#4A295F] text-white rounded-lg hover:bg-purple-900 transition font-medium cursor-pointer"
            >
              Discover Quests
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {activeQuests.map((record) => (
              <div key={record.quest_id} className="flex gap-4 items-stretch">
                <div className="flex-1">
                  <QuestCard
                    quest={record.quest_data}
                    onClick={() => handleQuestClick(record.quest_id)}
                  />
                </div>
                <button
                  onClick={() => handleCompleteQuest(record.quest_id, record.quest_data.title)}
                  className="px-6 py-4 bg-[#4A295F] text-white font-bold rounded-lg hover:bg-purple-900 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Complete
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Rating Modal */}
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
      </main>
    </div>
  );
}
