'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import { apiClient } from '@/lib/api';
import { useToast } from '@/lib/toast';

interface Friend {
    user_id: string;
    friend_id: string;
    friend_email: string;
    friend_name: string;
    friend_photo?: string;
}

interface ShareToFriendsModalProps {
    questTitle: string;
    questUrl: string;
    onClose: () => void;
}

export default function ShareToFriendsModal({ questTitle, questUrl, onClose }: ShareToFriendsModalProps) {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [friends, setFriends] = useState<Friend[]>([]);
    const [loading, setLoading] = useState(true);
    const [sendingId, setSendingId] = useState<string | null>(null);

    useEffect(() => {
        const fetchFriends = async () => {
            if (!user) return;
            try {
                const data = await apiClient.get<Friend[]>(`/api/friends/${user.uid}`);
                setFriends(data);
            } catch (error) {
                console.error('Error fetching friends:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFriends();
    }, [user]);

    const handleSendDM = async (friend: Friend) => {
        if (!user) return;

        try {
            setSendingId(friend.friend_id);
            const content = `Check out this quest: ${questTitle}\n${questUrl}`;

            await apiClient.post('/api/messages/send', {
                sender_id: user.uid,
                receiver_id: friend.friend_id,
                content: content
            });

            showToast(`Shared with ${friend.friend_name || friend.friend_email}!`, 'success');
            onClose();
        } catch (error) {
            console.error('Error sending DM:', error);
            showToast('Failed to send message', 'error');
        } finally {
            setSendingId(null);
        }
    };

    return (
        <div className="fixed inset-0 backdrop-blur-md bg-black/10 flex items-center justify-center z-[60] p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full border border-gray-100 flex flex-col max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-[#4A295F]">Share with Friends</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {loading ? (
                        <div className="text-center py-10">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#4A295F] mx-auto"></div>
                            <p className="mt-4 text-gray-500">Finding your friends...</p>
                        </div>
                    ) : friends.length === 0 ? (
                        <div className="text-center py-10 px-4">
                            <p className="text-gray-500 mb-4">No friends added yet.</p>
                            <button
                                onClick={() => {
                                    window.location.href = '/friends';
                                }}
                                className="text-[#4A295F] font-bold hover:underline"
                            >
                                Add some friends first!
                            </button>
                        </div>
                    ) : (
                        friends.map((friend) => (
                            <div
                                key={friend.friend_id}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-purple-200 transition group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-[#4A295F] font-bold overflow-hidden shadow-sm">
                                        {friend.friend_photo ? (
                                            <img src={friend.friend_photo} alt={friend.friend_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span>{(friend.friend_name || friend.friend_email)[0].toUpperCase()}</span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{friend.friend_name || friend.friend_email.split('@')[0]}</p>
                                        <p className="text-xs text-gray-500">{friend.friend_email}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleSendDM(friend)}
                                    disabled={!!sendingId}
                                    className="px-4 py-2 bg-[#4A295F] text-white text-sm font-bold rounded-lg hover:bg-purple-900 transition shadow-md disabled:opacity-50"
                                >
                                    {sendingId === friend.friend_id ? 'Sending...' : 'Send'}
                                </button>
                            </div>
                        ))
                    )}
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
