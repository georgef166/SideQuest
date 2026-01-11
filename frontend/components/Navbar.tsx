'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';
import AuthButton from './AuthButton';

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const { user } = useAuth();

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Favorites', path: '/favorites' },
        { name: 'Friends', path: '/friends' },
        { name: 'Profile', path: '/profile' },
        { name: 'Quests', path: '/quests' },
    ];

    return (
        <nav className="bg-white border-b border-gray-200" style={{ borderBottomColor: 'rgba(0,0,0,0.08)' }}>
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="grid grid-cols-3 items-center h-20 gap-4">
                    {/* Left: Logo */}
                    <div>
                        <button
                            onClick={() => router.push('/')}
                            className="flex items-center gap-2 hover:opacity-80 transition bg-transparent border-none cursor-pointer"
                        >
                            <img 
                                src="/sideQuestNoBg.png" 
                                alt="SideQuest Logo" 
                                className="h-8 w-8 object-contain"
                            />
                            <span 
                                className="text-2xl text-[#4A295F] hover:text-purple-900 transition"
                                style={{ fontWeight: 800, fontFamily: 'var(--font-inter)', letterSpacing: '-0.03em', lineHeight: 1 }}
                            >
                                SideQuest
                            </span>
                        </button>
                    </div>

                    {/* Center: Nav Links */}
                    <div className="flex justify-center gap-8">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.path;

                            // Only show certain links if user is logged in, or always show Home
                            if (!user && link.path !== '/') return null;

                            return (
                                <button
                                    key={link.path}
                                    onClick={() => router.push(link.path)}
                                    className={`transition text-sm font-semibold cursor-pointer border-b-2 h-full flex items-center ${isActive
                                            ? 'text-[#4A295F] border-[#4A295F]'
                                            : 'text-black border-transparent hover:text-[#4A295F] hover:border-[#4A295F]'
                                        }`}
                                    style={{
                                        fontWeight: 600,
                                        fontSize: '15px',
                                        fontFamily: 'var(--font-inter)',
                                        letterSpacing: 'normal',
                                        lineHeight: '1',
                                        paddingTop: '2px' // Small adjustment to align with border
                                    }}
                                >
                                    {link.name}
                                </button>
                            );
                        })}
                    </div>

                    {/* Right: Auth Actions */}
                    <div className="flex justify-end">
                        <AuthButton />
                    </div>
                </div>
            </div>
        </nav>
    );
}
