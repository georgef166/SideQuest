'use client';

import { useRouter } from 'next/navigation';
import AuthButton from '@/components/AuthButton';
import { useAuth } from '@/lib/useAuth';
import FriendsSection from '@/components/FriendsSection';
import Navbar from '@/components/Navbar';

export default function FriendsPage() {
    const router = useRouter();
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <FriendsSection />
            </main>
        </div>
    );
}
