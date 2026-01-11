'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/useAuth';
import { apiClient } from '@/lib/api';
import { useToast } from '@/lib/toast';

interface AddFriendModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddFriendModal({ onClose, onSuccess }: AddFriendModalProps) {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !email) return;

        setLoading(true);
        try {
            await apiClient.post('/api/friends/request', {
                sender_id: user.uid,
                sender_name: user.displayName || user.email?.split('@')[0] || 'A user',
                receiver_email: email
            });
            showToast('Friend request sent!', 'success');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error sending friend request:', error);
            showToast('Failed to send request. Try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-scale-in">
                <h2 className="text-xl font-bold text-[#4A295F] mb-4">Add a Friend</h2>
                <p className="text-gray-600 mb-6">Enter your friend's email address to send them a request.</p>

                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="friend@example.com"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4A295F] focus:outline-none text-black"
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-[#4A295F] text-white rounded-lg hover:bg-purple-900 transition disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Sending...
                                </>
                            ) : (
                                'Send Request'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
