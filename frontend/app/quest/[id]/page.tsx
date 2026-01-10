'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Quest } from '@/lib/types';

export default function QuestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const questId = params.id as string;
  
  const [quest, setQuest] = useState<Quest | null>(null);
  const [loading, setLoading] = useState(true);

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
  }, [questId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading quest...</p>
        </div>
      </div>
    );
  }

  if (!quest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-2xl font-bold text-blue-600">🎯 SideQuest</h1>
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                ← Back Home
              </button>
            </div>
          </div>
        </nav>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">❓</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Quest Not Found</h2>
            <p className="text-gray-600 mb-6">This quest doesn't exist or has expired.</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-blue-600">🎯 SideQuest</h1>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              ← Back to Quests
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quest Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">{quest.title}</h1>
              <p className="text-xl text-gray-600">{quest.description}</p>
            </div>
            <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-semibold">
              {quest.category}
            </span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {quest.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Quest Stats */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-3xl mb-1">⏱️</div>
              <div className="text-2xl font-bold text-gray-800">{totalTime} min</div>
              <div className="text-sm text-gray-600">Total Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-1">💰</div>
              <div className="text-2xl font-bold text-gray-800">${totalCost.toFixed(0)}</div>
              <div className="text-sm text-gray-600">Estimated Cost</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-1">
                {quest.difficulty === 'low_energy' ? '😌' : 
                 quest.difficulty === 'medium_energy' ? '🚶' : '🏃'}
              </div>
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
                <strong>💡 Best Time:</strong> {quest.best_time}
              </p>
            </div>
          )}
        </div>

        {/* Quest Steps */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Adventure Steps</h2>
          
          <div className="space-y-6">
            {quest.steps.map((step, index) => (
              <div key={step.order} className="flex gap-4">
                {/* Step Number */}
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    {step.order}
                  </div>
                  {index < quest.steps.length - 1 && (
                    <div className="w-0.5 h-16 bg-blue-200 mx-auto mt-2"></div>
                  )}
                </div>

                {/* Step Content */}
                <div className="flex-grow pb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-blue-600 uppercase">
                        {step.type}
                      </span>
                      {step.estimated_time && (
                        <span className="text-sm text-gray-500">
                          • {step.estimated_time} min
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{step.name}</h3>
                    {step.description && (
                      <p className="text-gray-600 mb-3">{step.description}</p>
                    )}
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <span>📍</span>
                      <span>
                        {step.location.lat.toFixed(4)}, {step.location.lng.toFixed(4)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex gap-4">
            <button className="flex-1 px-6 py-4 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors">
              🎯 Start Quest
            </button>
            <button className="flex-1 px-6 py-4 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors">
              ❤️ Save to Favorites
            </button>
            <button className="flex-1 px-6 py-4 bg-purple-500 text-white font-bold rounded-lg hover:bg-purple-600 transition-colors">
              🔗 Share Quest
            </button>
          </div>
          
          <div className="mt-4 text-center">
            <button className="text-gray-600 hover:text-gray-800 text-sm">
              📍 View on Map
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
