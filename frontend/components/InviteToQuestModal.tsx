'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/useAuth';
import { apiClient } from '@/lib/api';
import { useToast } from '@/lib/toast';
import { Quest } from '@/lib/types';

interface Friend {
    friend_id: string;
    friend_name: string;
    friend_email: string;
}

interface InviteToQuestModalProps {
    friend: Friend;
    quests: Quest[];
    onClose: () => void;
}

export default function InviteToQuestModal({ friend, quests, onClose }: InviteToQuestModalProps) {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [sendingId, setSendingId] = useState<string | null>(null);

    const handleSendInvite = async (quest: Quest) => {
        if (!user) return;

        try {
            setSendingId(quest.quest_id);
            const questUrl = `${window.location.origin}/quest/${quest.quest_id}`;
            const content = `Hey! I want to go on this adventure with you: ${quest.title}\n${questUrl}`;

            await apiClient.post('/api/messages/send', {
                sender_id: user.uid,
                receiver_id: friend.friend_id,
                content: content
            });

            showToast(`Invite sent to ${friend.friend_name || friend.friend_email}!`, 'success');
            onClose();
        } catch (error) {
            console.error('Error sending invite:', error);
            showToast('Failed to send invite', 'error');
        } finally {
            setSendingId(null);
        }
    };

    return (
        <div className="fixed inset-0 backdrop-blur-md bg-black/10 flex items-center justify-center z-[60] p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full border border-gray-100 flex flex-col max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-[#4A295F]">Invite {friend.friend_name || friend.friend_email.split('@')[0]}</h2>
                        <p className="text-sm text-black font-medium mt-1">Select a quest to send as an invite</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {quests.map((quest) => (
                        <div
                            key={quest.quest_id}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-purple-200 transition group"
                        >
                            <div className="flex-1 pr-4">
                                <p className="font-bold text-gray-900 line-clamp-1">{quest.title}</p>
                                <p className="text-xs text-black font-medium">{quest.category} • {quest.estimated_time} min</p>
                            </div>
                            <button
                                onClick={() => handleSendInvite(quest)}
                                disabled={!!sendingId}
                                className="px-4 py-2 bg-[#4A295F] text-white text-sm font-bold rounded-lg hover:bg-purple-900 transition shadow-md disabled:opacity-50"
                            >
                                {sendingId === quest.quest_id ? 'Sending...' : 'Invite'}
                            </button>
                        </div>
                    ))}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
