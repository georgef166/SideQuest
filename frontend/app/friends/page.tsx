'use client';

import { useRouter } from 'next/navigation';
import AuthButton from '@/components/AuthButton';
import { useAuth } from '@/lib/useAuth';
import FriendsSection from '@/components/FriendsSection';

export default function FriendsPage() {
    const router = useRouter();
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-white">
            <nav className="bg-white border-b border-gray-200" style={{ borderBottomColor: 'rgba(0,0,0,0.08)' }}>
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="grid grid-cols-3 items-center h-20 gap-4">
                        {/* Left: Logo */}
                        <div>
                            <button
                                onClick={() => router.push('/')}
                                className="text-2xl text-[#4A295F] hover:text-purple-900 transition cursor-pointer"
                                style={{ fontWeight: 800, fontFamily: 'var(--font-inter)', letterSpacing: '-0.03em', lineHeight: 1 }}
                            >
                                SideQuest
                            </button>
                        </div>

                        {/* Center: Nav Links */}
                        {user && (
                            <div className="flex justify-center gap-8">
                                <button
                                    onClick={() => router.push('/')}
                                    className="text-gray-700 hover:text-gray-900 transition text-sm font-semibold cursor-pointer border-b-2 border-transparent hover:border-gray-900"
                                    style={{ fontWeight: 600, fontSize: '15px', fontFamily: 'var(--font-inter)', letterSpacing: 'normal', lineHeight: '1' }}
                                >
                                    Home
                                </button>
                                <button
                                    onClick={() => router.push('/favorites')}
                                    className="text-gray-700 hover:text-gray-900 transition text-sm font-semibold cursor-pointer border-b-2 border-transparent hover:border-gray-900"
                                    style={{ fontWeight: 600, fontSize: '15px', fontFamily: 'var(--font-inter)', letterSpacing: 'normal', lineHeight: '1' }}
                                >
                                    Favorites
                                </button>
                                <button
                                    onClick={() => router.push('/friends')}
                                    className="text-[#4A295F] transition text-sm font-semibold cursor-pointer border-b-2 border-[#4A295F]"
                                    style={{ fontWeight: 600, fontSize: '15px', fontFamily: 'var(--font-inter)', letterSpacing: 'normal', lineHeight: '1' }}
                                >
                                    Friends
                                </button>
                                <button
                                    onClick={() => router.push('/profile')}
                                    className="text-gray-700 hover:text-gray-900 transition text-sm font-semibold cursor-pointer border-b-2 border-transparent hover:border-gray-900"
                                    style={{ fontWeight: 600, fontSize: '15px', fontFamily: 'var(--font-inter)', letterSpacing: 'normal', lineHeight: '1' }}
                                >
                                    Profile
                                </button>
                            </div>
                        )}

                        {/* Right: Auth Actions */}
                        <div className="flex justify-end">
                            <AuthButton />
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <FriendsSection />
            </main>
        </div>
    );
}
