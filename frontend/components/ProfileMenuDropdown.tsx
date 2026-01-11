'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { signOut } from '@/lib/auth';

interface MenuItemConfig {
  label: string;
  href?: string;
  onClick?: () => void;
}

const PROFILE_MENU_ITEMS: MenuItemConfig[] = [
  { label: 'Overview', href: '/profile?section=overview' },
  { label: 'Personal Info', href: '/profile?section=personal_info' },
  { label: 'Achievements', href: '/profile?section=achievements' },
  { label: 'Preferences', href: '/profile?section=preferences' },
  { label: 'Stats', href: '/profile?section=stats' },
  { label: 'Sign Out', onClick: () => signOut() },
];

interface ProfileMenuDropdownProps {
  photoURL?: string;
  displayName?: string;
}


function ProfileMenuDropdownContent({ photoURL, displayName }: ProfileMenuDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuItemsRef = useRef<(HTMLAnchorElement | null)[]>([]);

  // ... (rest of the code) ...



  // Determine which item should be highlighted based on current URL section
  useEffect(() => {
    const currentSection = searchParams?.get('section');
    if (currentSection) {
      const index = PROFILE_MENU_ITEMS.findIndex(item => item.href && item.href.includes(`section=${currentSection}`));
      if (index >= 0) {
        setSelectedIndex(index);
      }
    }
  }, [searchParams]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) {
        // Open menu with Enter or Space when trigger is focused
        if ((e.key === 'Enter' || e.key === ' ') && document.activeElement === triggerRef.current) {
          e.preventDefault();
          setIsOpen(true);
          setFocusedIndex(-1); // Do not focus any item on first open
        }
        return;
      }

      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          setFocusedIndex(-1);
          triggerRef.current?.focus();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((prev) => {
            const next = prev < PROFILE_MENU_ITEMS.length - 1 ? prev + 1 : 0;
            return next;
          });
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((prev) => {
            const next = prev > 0 ? prev - 1 : PROFILE_MENU_ITEMS.length - 1;
            return next;
          });
          break;
        case 'Tab':
          e.preventDefault();
          if (e.shiftKey) {
            setFocusedIndex((prev) => {
              const next = prev > 0 ? prev - 1 : PROFILE_MENU_ITEMS.length - 1;
              return next;
            });
          } else {
            setFocusedIndex((prev) => {
              const next = prev < PROFILE_MENU_ITEMS.length - 1 ? prev + 1 : 0;
              return next;
            });
          }
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (focusedIndex >= 0) {
            setSelectedIndex(focusedIndex);
            menuItemsRef.current[focusedIndex]?.click();
            setIsOpen(false);
            setFocusedIndex(-1);
          }
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, focusedIndex]);

  // Focus the menu item when focusedIndex changes
  useEffect(() => {
    if (isOpen && focusedIndex >= 0) {
      menuItemsRef.current[focusedIndex]?.focus();
    }
  }, [focusedIndex, isOpen]);

  // Close menu when navigating
  const handleMenuItemClick = (index: number) => {
    setIsOpen(false);
    setFocusedIndex(-1);
    setSelectedIndex(index);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        onClick={() => {
          setIsOpen((prev) => {
            const next = !prev;
            if (!next) {
              setFocusedIndex(-1);
            }
            return next;
          });
          // Do not set focus to any item on first open
        }}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Profile menu"
        className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#4A295F] focus:ring-offset-2 rounded-full"
      >
        {photoURL ? (
          <img
            src={photoURL}
            alt={displayName || 'User'}
            className="w-8 h-8 rounded-full cursor-pointer"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#4A295F] flex items-center justify-center text-white text-sm font-bold">
            {displayName?.charAt(0).toUpperCase() || 'U'}
          </div>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="menu"
          className="absolute left-0 top-full mt-2 w-44 -ml-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
          style={{
            animation: 'dropdownFadeIn 0.15s ease-out',
          }}
        >
          {PROFILE_MENU_ITEMS.map((item, index) => (
            item.href ? (
              <Link
                key={index}
                href={item.href}
                ref={(el) => {
                  if (el) menuItemsRef.current[index] = el;
                }}
                role="menuitem"
                onClick={() => handleMenuItemClick(index)}
                className={`block w-full text-left px-3 py-2.5 font-semibold transition-colors focus:outline-none ${(focusedIndex === index || selectedIndex === index)
                  ? 'bg-purple-50 text-[#4A295F] border-l-4 border-l-[#4A295F]'
                  : 'text-gray-700 hover:bg-gray-50 border-l-4 border-l-transparent'
                  }`}
                style={{ fontSize: '14px' }}
                tabIndex={isOpen ? 0 : -1}
              >
                {item.label}
              </Link>
            ) : (
              <button
                key={index}
                role="menuitem"
                onClick={async () => {
                  if (item.label === 'Sign Out') {
                    await signOut();
                    router.push('/');
                  } else {
                    item.onClick?.();
                  }
                  handleMenuItemClick(index);
                }}
                className={`w-full text-left px-3 py-2.5 font-semibold transition-colors focus:outline-none ${(focusedIndex === index || selectedIndex === index)
                  ? 'bg-purple-50 text-[#4A295F] border-l-4 border-l-[#4A295F]'
                  : 'text-gray-700 hover:bg-gray-50 border-l-4 border-l-transparent'
                  }`}
                style={{ fontSize: '14px' }}
                tabIndex={isOpen ? 0 : -1}
              >
                {item.label}
              </button>
            )
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes dropdownFadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

function ProfileMenuDropdownWrapper(props: ProfileMenuDropdownProps) {
  return (
    <Suspense fallback={<div className="w-8 h-8 rounded-full bg-[#4A295F]" />}>
      <ProfileMenuDropdownContent {...props} />
    </Suspense>
  );
}

export default ProfileMenuDropdownWrapper;
