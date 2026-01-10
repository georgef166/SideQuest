'use client';

import AuthButton from '@/components/AuthButton';
import { useAuth } from '@/lib/useAuth';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">🎯 SideQuest</h1>
            </div>
            <AuthButton />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {user ? (
          <div className="text-center">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
              <div className="mb-6">
                {user.photoURL && (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || 'User'} 
                    className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-blue-500"
                  />
                )}
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  Welcome, {user.displayName}! 🎉
                </h2>
                <p className="text-gray-600">{user.email}</p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <h3 className="text-xl font-semibold text-green-800">Authentication Working!</h3>
                </div>
                <p className="text-green-700">Your Google OAuth login is successfully configured.</p>
              </div>

              <div className="space-y-4 text-left">
                <div className="bg-gray-50 p-4 rounded">
                  <p className="font-semibold text-gray-700">User ID:</p>
                  <p className="text-sm text-gray-600 font-mono">{user.uid}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="font-semibold text-gray-700">Email Verified:</p>
                  <p className="text-sm text-gray-600">{user.emailVerified ? '✅ Yes' : '❌ No'}</p>
                </div>
              </div>

              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  🚀 <strong>Next Steps:</strong> You can now build the quest generation UI, 
                  integrate the backend API, and create the main app features!
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="bg-white rounded-lg shadow-lg p-12 max-w-2xl mx-auto">
              <div className="mb-8">
                <div className="text-6xl mb-4">🗺️</div>
                <h1 className="text-4xl font-bold text-gray-800 mb-4">
                  Welcome to SideQuest
                </h1>
                <p className="text-xl text-gray-600 mb-2">
                  Turn boredom into instant local adventures
                </p>
                <p className="text-gray-500">
                  Discover personalized quests, events, and hidden gems near you
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <h3 className="font-semibold text-gray-800 mb-4">What you'll get:</h3>
                <ul className="text-left space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Personalized quest recommendations based on your mood and budget</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Discover local events, restaurants, and hidden spots</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Save your favorite places and completed quests</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Share adventures with friends</span>
                  </li>
                </ul>
              </div>

              <div className="mb-6">
                <AuthButton />
              </div>

              <p className="text-sm text-gray-500">
                Sign in to start your adventure 🚀
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
