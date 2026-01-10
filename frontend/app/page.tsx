'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AuthButton from '@/components/AuthButton';
import QuestCard from '@/components/QuestCard';
import DualRangeSlider from '@/components/DualRangeSlider';
import { useAuth } from '@/lib/useAuth';
import { apiClient } from '@/lib/api';
import { Quest, Location } from '@/lib/types';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();
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

  // Debounce radius changes to avoid excessive API calls while dragging
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('Debounced radius updated - Range:', radiusRange);
      setDebouncedRadiusRange(radiusRange);
    }, 500); // Wait 500ms after user stops dragging

    return () => clearTimeout(timer);
  }, [radiusRange]);

  // Get user's location on mount
  useEffect(() => {
    if (!user) return;

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
                <span>⏱️ ${quest.estimated_time}min</span>
                <span>💰 $${quest.estimated_cost}</span>
                <span>📍 ${quest.steps.length} stops</span>
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
          categories: null,
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
  }, [userLocation, user, debouncedRadiusRange]);

  // Sort quests based on selected criteria
  const sortedQuests = [...quests].sort((a, b) => {
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
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-[#4A295F]">SideQuest</h1>
            </div>
            <AuthButton />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {user ? (
          <div>
            {/* Header Section */}
            <div className="mb-12">
              <h2 className="text-4xl font-bold text-[#4A295F] mb-2">
                Discover Your Next Adventure
              </h2>
              <p className="text-gray-600 text-lg mb-6">
                {userLocation ? (
                  <>Showing activities between {radiusRange[0]}km and {radiusRange[1]}km</>
                ) : (
                  <>Loading your location...</>
                )}
              </p>

              {userLocation && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg inline-block">
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
                        <strong>{quests.length} locations found</strong>
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
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
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
                    className={`bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer border border-gray-200 ${
                      selectedQuestId === quest.quest_id ? 'ring-2 ring-[#4A295F]' : ''
                    }`}
                    onMouseEnter={() => setSelectedQuestId(quest.quest_id)}
                    onMouseLeave={() => setSelectedQuestId(null)}
                    onClick={() => {
                      router.push(`/quest/${quest.quest_id}`);
                    }}
                  >
                    {/* Activity Image */}
                    <div className="w-full h-48 bg-gray-200 overflow-hidden">
                      <img
                        src={`https://images.unsplash.com/photo-${Math.floor(Math.random() * 10000)}-?auto=format&fit=crop&w=400&h=300`}
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
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
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
                      <div className="flex justify-between items-center text-sm text-gray-600 border-t border-gray-100 pt-3">
                        <div className="flex gap-4">
                          <span>
                            <strong>{quest.estimated_time}</strong> min
                          </span>
                          <span>
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
                  className="px-6 py-2 bg-[#4A295F] text-white rounded-lg hover:bg-purple-900 transition"
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
