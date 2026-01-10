'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AuthButton from '@/components/AuthButton';
import QuestCard from '@/components/QuestCard';
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
  const [radiusKm, setRadiusKm] = useState<number>(50);
  const [debouncedRadius, setDebouncedRadius] = useState<number>(50);

  // Debounce radius changes to avoid excessive API calls while dragging
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('Debounced radius updated to:', radiusKm);
      setDebouncedRadius(radiusKm);
    }, 500); // Wait 500ms after user stops dragging

    return () => clearTimeout(timer);
  }, [radiusKm]);

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
        console.log('Fetching quests for location:', userLocation, 'radius:', debouncedRadius, 'km');
        const response = await apiClient.post<Quest[]>('/api/quests/generate', {
          location: userLocation,
          radius_km: debouncedRadius,
          categories: null,
          preferences: null,
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
  }, [userLocation, user, debouncedRadius]);

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
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-blue-600">🎯 SideQuest</h1>
            </div>
            <AuthButton />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {user ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Map */}
            <div>
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Location</h2>
                
                {userLocation && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>📍 </strong>
                      {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                    </p>
                  </div>
                )}

                {locationError && (
                  <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800">⚠️ {locationError}</p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Using default location (McMaster University)
                    </p>
                  </div>
                )}

                <div
                  ref={mapRef}
                  className="w-full h-[400px] rounded-lg border border-gray-300"
                />
              </div>
            </div>

            {/* Right Column - Quests */}
            <div>
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  Discover Your Next Adventure
                </h2>
                <p className="text-gray-600 mb-4">
                  {userLocation ? (
                    <>📍 Showing quests within {radiusKm}km</>
                  ) : (
                    <>🗺️ Loading your location...</>
                  )}
                </p>

                {/* Distance Slider */}
                <div className="bg-white rounded-lg shadow p-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      Search Radius
                    </label>
                    <span className="text-sm font-semibold text-blue-600">
                      {radiusKm} km
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={radiusKm}
                    onChange={(e) => {
                      const newRadius = Number(e.target.value);
                      console.log('Slider changed to:', newRadius);
                      setRadiusKm(newRadius);
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1 km</span>
                    <span>25 km</span>
                    <span>50 km</span>
                    <span>75 km</span>
                    <span>100 km</span>
                  </div>
                  {debouncedRadius !== radiusKm && (
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Updating results...
                    </p>
                  )}
                </div>

                {/* Quest Statistics */}
                {quests.length > 0 && !loadingQuests && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <div className="text-sm text-blue-800">
                      <strong>{quests.length} quests found</strong>
                      <div className="mt-1 text-xs">
                        Nearest: {Math.min(...quests.map(q => q.distance || Infinity)).toFixed(1)} km • 
                        Farthest: {Math.max(...quests.filter(q => q.distance !== undefined).map(q => q.distance || 0)).toFixed(1)} km
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {loadingQuests && (
                <div className="text-center py-16">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Generating personalized quests...</p>
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

              {!loadingQuests && !questError && quests.length > 0 && (
                <div className="space-y-4">
                  {quests.map((quest, index) => (
                    <div
                      key={quest.quest_id}
                      id={`quest-${quest.quest_id}`}
                      className={`transition-all ${
                        selectedQuestId === quest.quest_id ? 'ring-2 ring-blue-500 rounded-lg' : ''
                      }`}
                      onMouseEnter={() => setSelectedQuestId(quest.quest_id)}
                      onMouseLeave={() => setSelectedQuestId(null)}
                    >
                      <QuestCard
                        quest={quest}
                        onClick={() => {
                          router.push(`/quest/${quest.quest_id}`);
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {!loadingQuests && !questError && quests.length === 0 && userLocation && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
                  <div className="text-4xl mb-4">🗺️</div>
                  <h3 className="text-xl font-semibold text-yellow-800 mb-2">
                    No quests found in your area
                  </h3>
                  <p className="text-yellow-700 mb-4">
                    The backend returned 0 quests. This might be because:
                  </p>
                  <ul className="text-sm text-yellow-700 text-left max-w-md mx-auto space-y-1">
                    <li>• No places/events found within radius</li>
                    <li>• Google Places API key not configured in backend</li>
                    <li>• Ticketmaster API key not configured in backend</li>
                    <li>• Quest generation algorithm needs more matching data</li>
                  </ul>
                  <p className="text-xs text-yellow-600 mt-4">
                    Check browser console (F12) and backend logs for details
                  </p>
                </div>
              )}
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
