'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/useAuth';
import { apiClient } from '@/lib/api';

interface Message {
    message_id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    timestamp: string;
    read: boolean;
}

interface ChatWindowProps {
    friendId: string;
    friendName: string;
    onClose: () => void;
}

export default function ChatWindow({ friendId, friendName, onClose }: ChatWindowProps) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Poll for messages
    useEffect(() => {
        if (!user) return;

        const fetchMessages = async () => {
            try {
                const history = await apiClient.get<Message[]>(`/api/messages/${user.uid}/${friendId}`);
                // Only update if different to avoid flickering (simplified check)
                setMessages(history);
            } catch (error) {
                console.error('Error fetching messages:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 3000); // Poll every 3 seconds

        return () => clearInterval(interval);
    }, [user, friendId]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user) return;

        const tempMessage: Message = {
            message_id: 'temp-' + Date.now(),
            sender_id: user.uid,
            receiver_id: friendId,
            content: newMessage,
            timestamp: new Date().toISOString(),
            read: false
        };

        // Optimistic update
        setMessages(prev => [...prev, tempMessage]);
        setNewMessage('');

        try {
            await apiClient.post('/api/messages/send', {
                sender_id: user.uid,
                receiver_id: friendId,
                content: tempMessage.content
            });
            // The polling will fetch the confirmed message
        } catch (error) {
            console.error('Error sending message:', error);
            // Remove temp message on error
            setMessages(prev => prev.filter(m => m.message_id !== tempMessage.message_id));
            alert('Failed to send message');
        }
    };

    return (
        <div className="fixed bottom-4 right-4 w-80 h-96 bg-white rounded-t-lg shadow-xl border border-gray-200 flex flex-col z-50">
            {/* Header */}
            <div className="bg-[#4A295F] text-white p-3 rounded-t-lg flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="font-semibold">{friendName}</span>
                </div>
                <button onClick={onClose} className="hover:bg-purple-800 p-1 rounded transition text-white">✕</button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-3">
                {loading ? (
                    <div className="text-center text-gray-400 text-sm mt-4">Loading conversation...</div>
                ) : messages.length === 0 ? (
                    <div className="text-center text-gray-400 text-sm mt-4">Say hi! 👋</div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.sender_id === user?.uid;
                        return (
                            <div key={msg.message_id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`max-w-[75%] px-3 py-2 rounded-lg text-sm ${isMe ? 'bg-[#4A295F] text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'
                                        }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-3 border-t border-gray-200 bg-white">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 border rounded-full px-3 py-1 text-sm focus:outline-none focus:border-[#4A295F] text-black"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="bg-[#4A295F] text-white rounded-full p-2 hover:bg-purple-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </div>
            </form>
        </div>
    );
}
