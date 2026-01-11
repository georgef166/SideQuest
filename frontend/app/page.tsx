'use client';

import { useState, useEffect, useRef } from 'react';
// TypeScript: declare window.google for Google Maps
declare global {
  interface Window {
    google?: any;
  }
}

// Google Maps Places Autocomplete hook
function usePlacesAutocomplete(
  inputRef: React.RefObject<HTMLInputElement | null>,
  onPlaceSelected: (location: { lat: number; lng: number }) => void
) {
  useEffect(() => {
    if (!window.google || !window.google.maps || !window.google.maps.places || !inputRef.current) return;
    const Autocomplete = window.google.maps.places.Autocomplete;
    if (!Autocomplete) return;
    const autocomplete = new Autocomplete(inputRef.current, {
      fields: ['geometry'],
      types: ['geocode'],
    });
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.geometry && place.geometry.location) {
        const loc = place.geometry.location;
        onPlaceSelected({ lat: loc.lat(), lng: loc.lng() });
      }
    });
    // No cleanup needed for autocomplete
  }, [inputRef, onPlaceSelected]);
}
import { useRouter } from 'next/navigation';
import AuthButton from '@/components/AuthButton';
import QuestCard from '@/components/QuestCard';
import DualRangeSlider from '@/components/DualRangeSlider';
import { useAuth } from '@/lib/useAuth';
import { useInitializeProfile } from '@/lib/useInitializeProfile';
import { apiClient } from '@/lib/api';
import { Quest, Location } from '@/lib/types';
import { addToFavorites, removeFromFavorites, getFavorites } from '@/lib/favorites';
import { saveUserPreferences, getUserPreferences } from '@/lib/preferences';
import { useToast } from '@/lib/toast';

export default function Home() {
  const locationInputRef = useRef<HTMLInputElement | null>(null);
  // Attach Google Places Autocomplete to location input
  usePlacesAutocomplete(locationInputRef, (loc) => {
    setUserLocation(loc);
    setLocationError('');
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter(loc);
    }
  });
  const router = useRouter();
  const { user, loading } = useAuth();
  const { showToast } = useToast();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const infoWindowRef = useRef<any>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loadingQuests, setLoadingQuests] = useState(false);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [locationError, setLocationError] = useState<string>('');
  const [questError, setQuestError] = useState<string>('');
  const [mapInitialized, setMapInitialized] = useState(false);
  const [selectedQuestId, setSelectedQuestId] = useState<string | null>(null);
  const [radiusRange, setRadiusRange] = useState<[number, number]>([0, 50]);
  const [debouncedRadiusRange, setDebouncedRadiusRange] = useState<[number, number]>([0, 50]);
  const [sortBy, setSortBy] = useState<string>('distance-asc');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [togglingFavorite, setTogglingFavorite] = useState<string | null>(null);

  const categories = [
    'Active',
    'Adventure',
    'Arts',
    'Bar',
    'Cafe',
    'Cheap',
    'Cultural',
    'Date Ideas',
    'Dessert',
    'Entertainment',
    'Events',
    'Food',
    'Hidden Gems',
    'Live',
    'Local Favorites',
    'Music',
    'Nightlife',
    'Relaxation',
    'Shopping',
    'Social',
    'Sports',
    'Trending',
    'Urban',
  ];

  // Fuzzy search function - checks if query is contained in text (case-insensitive)
  const fuzzyMatch = (query: string, text: string): boolean => {
    return text.toLowerCase().includes(query.toLowerCase());
  };

  // Load user's favorites
  const loadFavorites = async () => {
    if (!user) return;
    try {
      const userFavorites = await getFavorites(user.uid);
      const ids = new Set(userFavorites.map(fav => fav.item_id));
      setFavoriteIds(ids);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  // Load user preferences
  const loadPreferences = async () => {
    if (!user) return;
    try {
      const prefs = await getUserPreferences(user.uid);
      if (prefs) {
        if (prefs.radius) setRadiusRange(prefs.radius);
        if (prefs.categories) setSelectedCategories(prefs.categories);
        if (prefs.sortBy) setSortBy(prefs.sortBy);
      }
      return prefs;
    } catch (error) {
      console.error('Error loading preferences:', error);
      return null;
    }
  };

  // Save preferences when they change
  useEffect(() => {
    if (!user) return;

    const savePrefs = async () => {
      try {
        await saveUserPreferences(user.uid, {
          radius: radiusRange,
          categories: selectedCategories,
          lastLocation: userLocation || undefined,
          sortBy,
        });
      } catch (error) {
        console.error('Error saving preferences:', error);
      }
    };

    // Debounce the save
    const timer = setTimeout(savePrefs, 1000);
    return () => clearTimeout(timer);
  }, [user, radiusRange, selectedCategories, userLocation]);

  // Toggle favorite status
  const toggleFavorite = async (quest: Quest, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation
    if (!user) {
      showToast('Please sign in to save favorites', 'warning');
      return;
    }

    try {
      setTogglingFavorite(quest.quest_id);

      if (favoriteIds.has(quest.quest_id)) {
        await removeFromFavorites(user.uid, quest.quest_id);
        setFavoriteIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(quest.quest_id);
          return newSet;
        });
        showToast('Removed from favorites', 'success');
      } else {
        await addToFavorites(user.uid, quest.quest_id, 'quest', quest);
        setFavoriteIds(prev => new Set(prev).add(quest.quest_id));
        showToast('Added to favorites!', 'success');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      showToast('Failed to update favorite', 'error');
    } finally {
      setTogglingFavorite(null);
    }
  };

  // Initialize user profile on first login
  useInitializeProfile();

  // Debounce radius changes to avoid excessive API calls while dragging
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('Debounced radius updated - Range:', radiusRange);
      setDebouncedRadiusRange(radiusRange);
    }, 300); // Wait 300ms after user stops dragging

    return () => clearTimeout(timer);
  }, [radiusRange]);

  // Get user's location on mount
  useEffect(() => {
    if (!user) return;

    // Load favorites and preferences
    loadFavorites();
    (async () => {
      const prefs = await loadPreferences();
      if (!prefs || !prefs.onboardingCompleted) {
        // Redirect new users to onboarding to collect preferences
        router.push('/onboarding');
      }
    })();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
          setLocationError('');
          initMap(location);
        },
        (error) => {
          setLocationError(`Location error: ${error.message}`);
          const fallbackLocation = { lat: 43.2597, lng: -79.9191 };
          setUserLocation(fallbackLocation);
          initMap(fallbackLocation);
        }
      );
    } else {
      setLocationError('Geolocation is not supported by your browser');
      const fallbackLocation = { lat: 43.2597, lng: -79.9191 };
      setUserLocation(fallbackLocation);
      initMap(fallbackLocation);
    }
  }, [user]);

  // Initialize Google Map
  const initMap = async (location: Location) => {
    if (!mapRef.current || mapInitialized) return;

    try {
      // @ts-ignore
      const { Map } = (await google.maps.importLibrary('maps')) as any;
      // @ts-ignore
      const { AdvancedMarkerElement } = (await google.maps.importLibrary('marker')) as any;
      // @ts-ignore
      const { InfoWindow } = (await google.maps.importLibrary('maps')) as any;

      const map = new Map(mapRef.current, {
        center: location,
        zoom: 14,
        mapId: 'SIDEQUEST_MAP',
      });

      // Store map instance
      mapInstanceRef.current = map;

      // User location marker
      new AdvancedMarkerElement({
        map,
        position: location,
        title: 'Your Location',
      });

      // Create info window
      infoWindowRef.current = new InfoWindow();

      setMapInitialized(true);
    } catch (err) {
      console.error('Error loading map:', err);
    }
  };

  // Add quest markers to map
  const addQuestMarkers = async (questsToMap: Quest[]) => {
    if (!mapInstanceRef.current || !mapInitialized) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      marker.map = null;
    });
    markersRef.current = [];

    try {
      // @ts-ignore
      const { AdvancedMarkerElement, PinElement } = (await google.maps.importLibrary('marker')) as any;

      questsToMap.forEach((quest, index) => {
        // Use first step location as the quest marker
        const firstStep = quest.steps[0];
        if (!firstStep?.location) return;

        // Create custom pin with quest number
        const pinElement = new PinElement({
          background: selectedQuestId === quest.quest_id ? '#2563eb' : '#6366f1',
          borderColor: selectedQuestId === quest.quest_id ? '#1e40af' : '#4f46e5',
          glyphColor: '#ffffff',
          glyph: `${index + 1}`,
          scale: selectedQuestId === quest.quest_id ? 1.3 : 1.0,
        });

        const marker = new AdvancedMarkerElement({
          map: mapInstanceRef.current,
          position: firstStep.location,
          title: quest.title,
          content: pinElement.element,
        });

        // Add click listener to show quest preview
        marker.addListener('click', () => {
          setSelectedQuestId(quest.quest_id);

          // Scroll to quest card
          const questElement = document.getElementById(`quest-${quest.quest_id}`);
          if (questElement) {
            questElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }

          // Show info window
          const content = `
            <div style="max-width: 250px; padding: 8px;">
              <h3 style="font-weight: bold; font-size: 16px; margin-bottom: 8px; color: #1f2937;">
                ${quest.title}
              </h3>
              <p style="color: #6b7280; font-size: 14px; margin-bottom: 8px;">
                ${quest.description}
              </p>
              <div style="display: flex; gap: 12px; font-size: 12px; color: #4b5563;">
                <span>${quest.estimated_time}min</span>
                <span>$${quest.estimated_cost}</span>
                <span>${quest.steps.length} stops</span>
              </div>
              <button 
                onclick="window.location.href='/quest/${quest.quest_id}'"
                style="
                  margin-top: 12px;
                  width: 100%;
                  background: #2563eb;
                  color: white;
                  padding: 8px 16px;
                  border-radius: 6px;
                  border: none;
                  cursor: pointer;
                  font-weight: 500;
                "
              >
                View Details
              </button>
            </div>
          `;

          infoWindowRef.current.setContent(content);
          infoWindowRef.current.open(mapInstanceRef.current, marker);
        });

        markersRef.current.push(marker);
      });
    } catch (err) {
      console.error('Error adding quest markers:', err);
    }
  };

  // Update markers when quests or selected quest changes
  useEffect(() => {
    if (quests.length > 0 && mapInitialized) {
      addQuestMarkers(quests);
    }
  }, [quests, mapInitialized, selectedQuestId]);

  // Fetch quests when location is available or radius changes
  useEffect(() => {
    if (!userLocation || !user) return;

    const fetchQuests = async () => {
      setLoadingQuests(true);
      setQuestError('');

      try {
        console.log('Fetching quests for location:', userLocation, 'range:', debouncedRadiusRange, 'km');
        const response = await apiClient.post<Quest[]>('/api/quests/generate', {
          location: userLocation,
          radius_km: debouncedRadiusRange[1],
          categories: selectedCategories.length > 0 ? selectedCategories : null,
          preferences: {
            min_radius_km: debouncedRadiusRange[0],
          },
        });

        console.log('Quest response:', response.length, 'quests returned');
        setQuests(response);
        localStorage.setItem('currentQuests', JSON.stringify(response));
      } catch (error) {
        console.error('Error fetching quests:', error);
        setQuestError(`Failed to load quests: ${error}`);
      } finally {
        setLoadingQuests(false);
      }
    };

    fetchQuests();
  }, [userLocation, user, debouncedRadiusRange, selectedCategories]);

  // Filter quests based on search and categories
  const filteredQuests = quests.filter((quest) => {
    const matchesSearch =
      !searchQuery ||
      fuzzyMatch(searchQuery, quest.title) ||
      fuzzyMatch(searchQuery, quest.description) ||
      quest.tags?.some((tag) => fuzzyMatch(searchQuery, tag));

    const matchesCategories =
      selectedCategories.length === 0 ||
      selectedCategories.some((cat) =>
        quest.tags?.some((tag) => fuzzyMatch(cat, tag)) ||
        fuzzyMatch(cat, quest.title)
      );

    return matchesSearch && matchesCategories;
  });

  // Sort quests based on selected criteria
  const sortedQuests = [...filteredQuests].sort((a, b) => {
    switch (sortBy) {
      case 'name-asc':
        return a.title.localeCompare(b.title);
      case 'name-desc':
        return b.title.localeCompare(a.title);
      case 'price-asc':
        return a.estimated_cost - b.estimated_cost;
      case 'price-desc':
        return b.estimated_cost - a.estimated_cost;
      case 'distance-asc':
        return (a.distance || Infinity) - (b.distance || Infinity);
      case 'distance-desc':
        return (b.distance || 0) - (a.distance || 0);
      case 'time-asc':
        return a.estimated_time - b.estimated_time;
      case 'time-desc':
        return b.estimated_time - a.estimated_time;
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#4A295F] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-white border-b border-gray-200" style={{ borderBottomColor: 'rgba(0,0,0,0.08)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-3 items-center h-20 gap-4">
            {/* Left: Logo */}
            <div>
              <h1 className="text-2xl text-[#4A295F]" style={{ fontWeight: 800, fontFamily: 'var(--font-inter)', letterSpacing: '-0.03em', lineHeight: 1 }}>
                SideQuest
              </h1>
            </div>

            {/* Center: Nav Links */}
            {user && (
              <div className="flex justify-center gap-8">
                <button
                  onClick={() => router.push('/favorites')}
                  className="text-gray-700 hover:text-gray-900 transition text-sm font-semibold cursor-pointer border-b-2 border-transparent hover:border-gray-900"
                  style={{ fontWeight: 600, fontSize: '15px', fontFamily: 'var(--font-inter)', letterSpacing: 'normal', lineHeight: '1' }}
                >
                  Favorites
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
        {user ? (
          <div>
            <div className="mb-12">
              {/* Location Search Bar (Google Places Autocomplete) */}
              <div className="mb-4">
                <input
                  ref={locationInputRef}
                  type="text"
                  placeholder="Search for a location (address, city, landmark)"
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition-all mb-2"
                  style={{ borderColor: '#4A295F', backgroundColor: '#f9f9fb' }}
                  autoComplete="off"
                />
                <p className="text-xs text-gray-500 mt-1">Start typing to search for a new location. Powered by Google Places.</p>
              </div>

              {/* Centered Title and Subtitle Section */}
              <div className="flex flex-col items-center">
                <h2 className="page-title text-[#4A295F]" style={{ fontFamily: 'var(--font-inter)' }}>
                  Discover Your Next Adventure
                </h2>

                <p className="text-lg text-center subtitle" style={{ fontWeight: 500, fontFamily: 'var(--font-inter)', color: '#4B5563' }}>
                  {userLocation ? (
                    <>Showing activities between {radiusRange[0]}km and {radiusRange[1]}km</>
                  ) : (
                    <>Loading your location...</>
                  )}
                </p>
              </div>

              {userLocation && (
                <div className="p-3 bg-gray-50 rounded-lg mx-auto block w-fit mb-4" style={{ marginTop: '1rem' }}>
                  <p className="text-sm text-gray-700">
                    <strong>Location:</strong> {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                  </p>
                </div>
              )}

              {locationError && (
                <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">{locationError}</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Using default location (McMaster University)
                  </p>
                </div>
              )}

              {/* Search Bar */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search events, places, or categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition-all text-gray-900"
                  style={{
                    borderColor: searchQuery ? '#4A295F' : '#d1d5db',
                    backgroundColor: '#ffffff',
                  }}
                />
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="text-sm font-medium text-black mb-2 block">
                  Categories
                </label>
                <div className="overflow-x-auto scrollbar-hide">
                  <div className="flex gap-2 pb-2" style={{ width: 'max-content' }}>
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => {
                          setSelectedCategories(prev =>
                            prev.includes(category)
                              ? prev.filter(c => c !== category)
                              : [...prev, category]
                          );
                        }}
                        className="px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0 shadow-sm"
                        style={{
                          backgroundColor: selectedCategories.includes(category) ? '#4A295F' : '#e5e7eb',
                          color: selectedCategories.includes(category) ? 'white' : '#1f2937',
                          transform: selectedCategories.includes(category) ? 'scale(1.05)' : 'scale(1)',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          if (!selectedCategories.includes(category)) {
                            e.currentTarget.style.backgroundColor = '#d1d5db';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!selectedCategories.includes(category)) {
                            e.currentTarget.style.backgroundColor = '#e5e7eb';
                          }
                        }}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
                {selectedCategories.length > 0 && (
                  <button
                    onClick={() => {
                      setSelectedCategories([]);
                    }}
                    className="mt-2 text-sm hover:underline cursor-pointer"
                    style={{ color: '#4A295F' }}
                  >
                    Clear all filters ({selectedCategories.length})
                  </button>
                )}
              </div>
            </div>

            {/* Map and Search Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
              {/* Map */}
              <div className="lg:col-span-1">
                <div
                  ref={mapRef}
                  className="w-full h-[400px] rounded-lg border border-gray-200 shadow-sm"
                />
              </div>

              {/* Search Controls */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-[#4A295F] mb-4">
                    Search Settings
                  </h3>

                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-gray-700">
                        Distance Range
                      </label>
                      <span className="text-sm font-semibold text-[#4A295F]">
                        {radiusRange[0]} - {radiusRange[1]} km
                      </span>
                    </div>

                    <div className="px-2 py-6">
                      <DualRangeSlider
                        min={0}
                        max={100}
                        value={radiusRange}
                        onChange={setRadiusRange}
                      />
                    </div>

                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0 km</span>
                      <span>25 km</span>
                      <span>50 km</span>
                      <span>75 km</span>
                      <span>100 km</span>
                    </div>
                  </div>

                  {JSON.stringify(debouncedRadiusRange) !== JSON.stringify(radiusRange) && (
                    <p className="text-xs text-gray-500 text-center">
                      Updating results...
                    </p>
                  )}

                  {/* Sort Dropdown */}
                  <div className="mb-4">
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Sort By
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A295F] text-sm bg-white"
                    >
                      <option value="distance-asc">Distance: Nearest First</option>
                      <option value="distance-desc">Distance: Farthest First</option>
                      <option value="name-asc">Name: A-Z</option>
                      <option value="name-desc">Name: Z-A</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="time-asc">Duration: Shortest First</option>
                      <option value="time-desc">Duration: Longest First</option>
                    </select>
                  </div>

                  {quests.length > 0 && !loadingQuests && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <div className="text-sm text-purple-900">
                        <strong>{filteredQuests.length} of {quests.length} locations</strong>
                        {(searchQuery || selectedCategories.length > 0) && (
                          <span className="text-xs block mt-1 text-purple-700">
                            {searchQuery && `Searching: "${searchQuery}"`}
                            {selectedCategories.length > 0 && ` • ${selectedCategories.length} categories`}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Activities Grid */}
            {loadingQuests && (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#4A295F] mx-auto"></div>
                <p className="mt-4 text-gray-600">Finding activities near you...</p>
              </div>
            )}

            {questError && !loadingQuests && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-700">{questError}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer"
                >
                  Try Again
                </button>
              </div>
            )}

            {!loadingQuests && !questError && sortedQuests.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedQuests.map((quest, index) => (
                  <div
                    key={quest.quest_id}
                    id={`quest-${quest.quest_id}`}
                    className={`bg-white rounded-xl overflow-hidden cursor-pointer transition-all duration-300 border border-gray-200 hover:shadow-2xl hover:-translate-y-1 relative group ${selectedQuestId === quest.quest_id ? 'ring-2 ring-[#4A295F] shadow-xl' : ''
                      }`}
                    onMouseEnter={() => setSelectedQuestId(quest.quest_id)}
                    onMouseLeave={() => setSelectedQuestId(null)}
                    onClick={() => {
                      router.push(`/quest/${quest.quest_id}`);
                    }}
                  >
                    {/* Activity Image */}
                    <div className="w-full h-56 bg-gray-200 overflow-hidden relative">
                      {/* Favorite Button */}
                      <button
                        onClick={(e) => toggleFavorite(quest, e)}
                        disabled={togglingFavorite === quest.quest_id}
                        className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:scale-110 hover:bg-white transition-all duration-200 flex items-center justify-center disabled:opacity-50 cursor-pointer"
                        title={favoriteIds.has(quest.quest_id) ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <svg
                          className="w-6 h-6"
                          fill={favoriteIds.has(quest.quest_id) ? '#FF385C' : 'none'}
                          stroke={favoriteIds.has(quest.quest_id) ? '#FF385C' : '#6b7280'}
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                      </button>
                      <img
                        src={(() => {
                          // Priority 1: Use tag-based themed image
                          const tag = quest.tags[0]?.toLowerCase() || '';
                          const tagImageMap: Record<string, string> = {
                            'coffee': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=400&h=300',
                            'food': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&h=300',
                            'restaurant': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&h=300',
                            'park': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=400&h=300',
                            'nature': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=400&h=300',
                            'art': 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=400&h=300',
                            'museum': 'https://images.unsplash.com/photo-1554907984-15263bfd63bd?auto=format&fit=crop&w=400&h=300',
                            'shopping': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&h=300',
                            'bar': 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=400&h=300',
                            'nightlife': 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=400&h=300',
                            'entertainment': 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=400&h=300',
                            'music': 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=400&h=300',
                            'sports': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=400&h=300',
                            'fitness': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=400&h=300',
                            'cafe': 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=400&h=300',
                            'bakery': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&h=300',
                            'beach': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&h=300',
                            'hiking': 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=400&h=300',
                            'adventure': 'https://images.unsplash.com/photo-1533130061792-64b345e4a833?auto=format&fit=crop&w=400&h=300',
                          };

                          // Check if we have a matching tag image
                          for (const [key, url] of Object.entries(tagImageMap)) {
                            if (tag.includes(key) || quest.title.toLowerCase().includes(key)) {
                              return url;
                            }
                          }

                          // Priority 2: Use first step's place data (if available in future)
                          // This would require the backend to include photo_url in quest steps
                          // const firstStepPhoto = quest.steps[0]?.photo_url;
                          // if (firstStepPhoto) return firstStepPhoto;

                          // Priority 3: Fallback to themed random image based on quest_id hash
                          const questHash = quest.quest_id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                          const imageIndex = questHash % 20; // Use 20 curated adventure images
                          const fallbackImages = [
                            'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=400&h=300',
                            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=400&h=300',
                            'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=400&h=300',
                            'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=400&h=300',
                            'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=400&h=300',
                            'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=400&h=300',
                            'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&h=300',
                            'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=400&h=300',
                            'https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=400&h=300',
                            'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=400&h=300',
                            'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=400&h=300',
                            'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=400&h=300',
                            'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=400&h=300',
                            'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=400&h=300',
                            'https://images.unsplash.com/photo-1478860409698-8707f313ee8b?auto=format&fit=crop&w=400&h=300',
                            'https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?auto=format&fit=crop&w=400&h=300',
                            'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=400&h=300',
                            'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?auto=format&fit=crop&w=400&h=300',
                            'https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?auto=format&fit=crop&w=400&h=300',
                            'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=400&h=300',
                          ];
                          return fallbackImages[imageIndex];
                        })()}
                        alt={quest.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=400&h=300';
                        }}
                      />
                    </div>

                    {/* Activity Info */}
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-[#4A295F] mb-2">
                        {quest.title}
                      </h3>
                      <p className="text-sm text-black mb-4 line-clamp-2">
                        {quest.description}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {quest.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="inline-block px-3 py-1 bg-purple-100 text-[#4A295F] text-xs font-medium rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Footer Info */}
                      <div className="flex justify-between items-center text-sm text-black border-t border-gray-100 pt-3">
                        <div className="flex gap-4">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <strong>{quest.estimated_time}</strong> min
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <strong>${Math.round(quest.estimated_cost)}</strong>
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {quest.steps.length} stops
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loadingQuests && !questError && filteredQuests.length === 0 && quests.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
                <h3 className="text-xl font-semibold text-blue-800 mb-2">
                  No activities match your filters
                </h3>
                <p className="text-blue-700 mb-4">
                  Try adjusting your search or removing some category filters.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategories([]);
                  }}
                  className="px-6 py-2 bg-[#4A295F] text-white rounded-lg hover:bg-purple-900 transition"
                >
                  Clear all filters
                </button>
              </div>
            )}

            {!loadingQuests && !questError && quests.length === 0 && userLocation && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  No activities found
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search radius or check back later for new activities.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-[#4A295F] text-white rounded-lg hover:bg-purple-900 transition cursor-pointer"
                >
                  Search Again
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <div className="bg-white rounded-lg border border-gray-200 p-12 max-w-2xl mx-auto shadow-sm">
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-[#4A295F] mb-4">
                  Welcome to SideQuest
                </h1>
                <p className="text-xl text-gray-600 mb-2">
                  Turn boredom into instant local adventures
                </p>
                <p className="text-gray-500">
                  Discover personalized activities and hidden gems near you
                </p>
              </div>

              <div className="bg-purple-50 rounded-lg p-6 mb-8 border border-purple-200">
                <h3 className="font-semibold text-[#4A295F] mb-4">What you'll get:</h3>
                <ul className="text-left space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-[#4A295F] mt-1 font-bold">✓</span>
                    <span>Personalized activity recommendations based on your preferences</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#4A295F] mt-1 font-bold">✓</span>
                    <span>Discover local events, restaurants, and hidden spots</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#4A295F] mt-1 font-bold">✓</span>
                    <span>Save your favorite places and completed activities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#4A295F] mt-1 font-bold">✓</span>
                    <span>Share adventures with friends</span>
                  </li>
                </ul>
              </div>

              <div className="mb-6">
                <AuthButton />
              </div>

              <p className="text-sm text-gray-500">
                Sign in to start your adventure
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
