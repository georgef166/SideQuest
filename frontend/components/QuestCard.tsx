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
        <h3 className="text-xl font-bold text-black">{quest.title}</h3>
        <span className="px-3 py-1 bg-purple-100 text-[#4A295F] rounded-full text-sm font-semibold">
          {quest.category}
        </span>
      </div>

      <p className="text-black mb-4">{quest.description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {[...new Set(quest.tags)].map((tag, index) => (
          <span
            key={`${tag}-${index}`}
            className="px-2 py-1 bg-purple-50 text-[#4A295F] rounded text-xs font-medium border border-purple-100"
          >
            #{tag}
          </span>
        ))}
      </div>

      <div className="flex justify-between items-center text-sm text-black font-medium">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {quest.estimated_time} min
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            ${quest.estimated_cost.toFixed(0)}
          </span>
          {quest.distance !== undefined && (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {quest.distance.toFixed(1)} km
            </span>
          )}
          <span className="capitalize">
            {quest.difficulty.replace('_', ' ')}
          </span>
        </div>
        <span className="text-[#4A295F] font-bold hover:translate-x-1 transition-transform inline-block">Open Quest →</span>
      </div>
    </div>
  );
}
