'use client';

import { useState, useEffect, useRef } from 'react';
import { signInWithGoogle } from '@/lib/auth';
import { useAuth } from '@/lib/useAuth';
import ProfileMenuDropdown from './ProfileMenuDropdown';


export default function AuthButton() {
  const { user, loading } = useAuth();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-10 w-32 rounded"></div>;
  }

  if (user) {
    return (
      <div className="flex items-center gap-4 mr-4">
        {/* Notification Bell */}
        <div className="relative" ref={notificationRef}>
          <button
            className={`p-2 rounded-full transition-colors relative ${isNotificationsOpen ? 'text-[#4A295F] bg-purple-50' : 'text-gray-500 hover:text-[#4A295F] hover:bg-purple-50'}`}
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            aria-label="Notifications"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {/* Notification Badge */}
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          {/* Notification Dropdown */}
          {isNotificationsOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                <span className="text-xs text-[#4A295F] font-medium cursor-pointer hover:underline">Mark all read</span>
              </div>
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3 text-gray-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p className="text-gray-600 font-medium text-sm">No new notifications</p>
                <p className="text-gray-400 text-xs mt-1">We'll let you know when something happens!</p>
              </div>
            </div>
          )}
        </div>

        <ProfileMenuDropdown
          photoURL={user.photoURL || undefined}
          displayName={user.displayName || 'User'}
        />
      </div>
    );
  }

  return (
    <button
      onClick={() => signInWithGoogle()}
      className="px-6 py-3 bg-[#4A295F] text-white rounded-lg hover:bg-purple-900 flex items-center gap-2 cursor-pointer"
      style={{ fontWeight: 600, fontSize: '14px', fontFamily: 'var(--font-inter)' }}
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
