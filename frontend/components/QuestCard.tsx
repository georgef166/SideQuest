'use client';

import { Quest } from '@/lib/types';

interface QuestCardProps {
  quest: Quest;
  onClick?: () => void;
}

export default function QuestCard({ quest, onClick }: QuestCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-bold">{quest.title}</h3>
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
          {quest.category}
        </span>
      </div>
      
      <p className="text-gray-600 mb-4">{quest.description}</p>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {quest.tags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
          >
            #{tag}
          </span>
        ))}
      </div>
      
      <div className="flex justify-between items-center text-sm text-gray-500">
        <div className="flex items-center gap-4">
          <span>⏱️ {quest.estimated_time} min</span>
          <span>💰 ${quest.estimated_cost.toFixed(0)}</span>
          <span>
            {quest.difficulty === 'low_energy' ? '😌' : 
             quest.difficulty === 'medium_energy' ? '🚶' : '🏃'} 
            {quest.difficulty.replace('_', ' ')}
          </span>
        </div>
        <span className="text-blue-500 font-medium">Open Quest →</span>
      </div>
    </div>
  );
}
