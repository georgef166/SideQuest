'use client';

import { signInWithGoogle, signOut } from '@/lib/auth';
import { useAuth } from '@/lib/useAuth';
import Link from 'next/link';

export default function AuthButton() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-10 w-32 rounded"></div>;
  }

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <Link href="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          {user.photoURL && (
            <img 
              src={user.photoURL} 
              alt={user.displayName || 'User'} 
              className="w-8 h-8 rounded-full cursor-pointer"
            />
          )}
          <span className="text-sm cursor-pointer">{user.displayName}</span>
        </Link>
        <button
          onClick={() => signOut()}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signInWithGoogle()}
      className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
        />
      </svg>
      Continue with Google
    </button>
  );
}
