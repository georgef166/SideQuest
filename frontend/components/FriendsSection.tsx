'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import { apiClient } from '@/lib/api';
import AddFriendModal from './AddFriendModal';
import ChatWindow from './ChatWindow';
import InviteToQuestModal from './InviteToQuestModal';
import { Quest } from '@/lib/types';

interface Friend {
    user_id: string;
    friend_id: string;
    friend_email: string;
    friend_name: string;
    friend_photo?: string;
    added_at: string;
}

export default function FriendsSection() {
    const { user } = useAuth();
    const [friends, setFriends] = useState<Friend[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [activeChat, setActiveChat] = useState<Friend | null>(null);
    const [invitingFriend, setInvitingFriend] = useState<Friend | null>(null);
    const [quests, setQuests] = useState<Quest[]>([]);
    const [loadingQuests, setLoadingQuests] = useState(false);

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

    useEffect(() => {
        fetchFriends();
        loadLocalQuests();
    }, [user]);

    const loadLocalQuests = () => {
        const stored = localStorage.getItem('currentQuests');
        if (stored) {
            setQuests(JSON.parse(stored));
        }
    };

    const handleInviteClick = (friend: Friend) => {
        if (quests.length === 0) {
            alert('No quests found to invite to. Try discovering some quests first!');
            return;
        }
        setInvitingFriend(friend);
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading friends...</div>;
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-4xl font-bold text-[#4A295F] mb-2">Friends</h1>
                    <p className="text-gray-600 text-lg">Connect with your friends and plan adventures together</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-6 py-3 bg-[#4A295F] text-white font-semibold rounded-lg hover:bg-purple-900 transition flex items-center gap-2 shadow-sm"
                >
                    + Add Friend
                </button>
            </div>

            {friends.length === 0 ? (
                <div className="bg-[#FDF7FF] border border-purple-100 rounded-xl p-16 text-center shadow-sm flex flex-col items-center justify-center min-h-[400px]">
                    <div className="text-[#4A295F] mb-6">
                        <svg className="w-20 h-20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-[#4A295F] mb-3">No friends added yet</h2>
                    <p className="text-gray-600 mb-8 text-lg max-w-md">
                        Start connecting with friends to share and plan adventures together!
                    </p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-8 py-3 bg-[#4A295F] text-white font-semibold rounded-lg hover:bg-purple-900 transition shadow-sm"
                    >
                        Add Your First Friend
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {friends.map((friend) => (
                        <div key={friend.friend_id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center text-xl font-bold text-gray-500 overflow-hidden">
                                    {friend.friend_photo ? (
                                        <img src={friend.friend_photo} alt={friend.friend_name} className="w-full h-full object-cover" />
                                    ) : (
                                        friend.friend_name?.[0]?.toUpperCase() || friend.friend_email[0].toUpperCase()
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-gray-900">{friend.friend_name || friend.friend_email.split('@')[0]}</h4>
                                    <p className="text-sm text-gray-500">{friend.friend_email}</p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setActiveChat(friend)}
                                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition"
                                >
                                    Message
                                </button>
                                <button
                                    onClick={() => handleInviteClick(friend)}
                                    className="flex-1 px-4 py-2 bg-[#4A295F]/10 text-[#4A295F] font-bold rounded-lg hover:bg-[#4A295F]/20 transition"
                                >
                                    Invite
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showAddModal && (
                <AddFriendModal
                    onClose={() => setShowAddModal(false)}
                    onSuccess={fetchFriends}
                />
            )}

            {activeChat && (
                <ChatWindow
                    friendId={activeChat.friend_id}
                    friendName={activeChat.friend_name || activeChat.friend_email}
                    onClose={() => setActiveChat(null)}
                />
            )}

            {invitingFriend && (
                <InviteToQuestModal
                    friend={invitingFriend}
                    quests={quests}
                    onClose={() => setInvitingFriend(null)}
                />
            )}
        </div>
    );
}
