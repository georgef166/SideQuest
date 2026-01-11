"use client";

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DualRangeSlider from '@/components/DualRangeSlider';
import { useAuth } from '@/lib/useAuth';
import { saveUserPreferences, getUserPreferences } from '@/lib/preferences';
import { useToast } from '@/lib/toast';

const categoriesList = [
  'Food', 'Events', 'Outdoors', 'Arts', 'Music', 'Cafe', 'Bars', 'Active', 'Hidden Gems', 'Date Ideas', 'Shopping', 'Nightlife', 'Relaxation'
];

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const { showToast } = useToast();

  const isEditMode = searchParams.get('mode') === 'edit';

  const [step, setStep] = useState(1);
  const [radius, setRadius] = useState<[number, number]>([0, 10]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('distance-asc');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user && !loading) router.push('/');
  }, [user, loading]);

  useEffect(() => {
    // If user already has onboardingCompleted, skip IF NOT in edit mode
    if (!user) return;
    (async () => {
      const prefs = await getUserPreferences(user.uid);

      // Pre-fill data if editing or existing
      if (prefs) {
        if (prefs.radius) {
          // Clamp values to ensure they are within slider bounds [0, 50]
          const clampedMin = Math.max(0, Math.min(50, prefs.radius[0]));
          const clampedMax = Math.max(0, Math.min(50, prefs.radius[1]));
          setRadius([clampedMin, clampedMax]);
        }
        if (prefs.categories) setSelectedCategories(prefs.categories);
        if (prefs.sortBy) setSortBy(prefs.sortBy);

        if (prefs.onboardingCompleted && !isEditMode) {
          router.push('/');
        }
      }
    })();
  }, [user, isEditMode]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const saveAndFinish = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await saveUserPreferences(user.uid, {
        radius,
        categories: selectedCategories,
        sortBy,
        onboardingCompleted: true,
      });
      showToast('Preferences saved!', 'success');
      router.push(isEditMode ? '/profile' : '/');
    } catch (err) {
      console.error('Failed to save preferences', err);
      showToast('Failed to save preferences', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="max-w-3xl w-full p-8 bg-white rounded-lg shadow">
        <h1 className="page-title text-[#4A295F]">{isEditMode ? 'Edit Preferences' : 'Welcome to SideQuest'}</h1>
        <p className="text-lg subtitle mt-2" style={{ fontWeight: 500, color: '#4B5563' }}>
          {isEditMode ? 'Update your settings to personalize your feed.' : 'Quick setup — tell us your preferences so we can personalize your feed.'}
        </p>

        <div className="space-y-6">
          {step === 1 && (
            <div>
              <h3 className="font-semibold mb-2 text-black">Preferred search radius (km)</h3>
              <DualRangeSlider min={0} max={50} value={radius} onChange={(v) => setRadius(v)} />
              <div className="text-sm text-gray-800 mt-2">Selected: {radius[0]}km — {radius[1]}km</div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 className="font-semibold mb-2 text-black">Favorite categories</h3>
              <div className="flex flex-wrap gap-2">
                {categoriesList.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition ${selectedCategories.includes(cat) ? 'bg-[#4A295F] text-white' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 className="font-semibold mb-2 text-black">Default sort</h3>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full p-3 rounded border text-black bg-white">
                <option value="distance-asc" className="text-black">Distance (closest)</option>
                <option value="distance-desc" className="text-black">Distance (farthest)</option>
                <option value="price-asc" className="text-black">Price (low to high)</option>
                <option value="price-desc" className="text-black">Price (high to low)</option>
                <option value="time-asc" className="text-black">Time (short to long)</option>
                <option value="time-desc" className="text-black">Time (long to short)</option>
                <option value="name-asc" className="text-black">Name (A → Z)</option>
              </select>
            </div>
          )}

          <div className="flex justify-between mt-4">
            <button
              onClick={async () => {
                if (step === 1) {
                  if (isEditMode) {
                    router.push('/profile');
                  } else {
                    if (!user) return router.push('/');
                    // Mark onboarding completed even if user skips
                    await saveUserPreferences(user.uid, { onboardingCompleted: true });
                    router.push('/');
                  }
                } else {
                  setStep(step - 1);
                }
              }}
              className="px-4 py-2 bg-gray-100 text-gray-900 rounded hover:bg-gray-200 transition"
            >
              {step === 1 ? (isEditMode ? 'Cancel' : 'Skip') : 'Back'}
            </button>

            {step < 3 ? (
              <button onClick={() => setStep(step + 1)} className="px-4 py-2 bg-[#4A295F] text-white rounded hover:bg-purple-900 transition">Next</button>
            ) : (
              <button onClick={saveAndFinish} className="px-4 py-2 bg-[#4A295F] text-white rounded hover:bg-purple-900 transition" disabled={saving}>{saving ? 'Saving...' : 'Finish'}</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>}>
      <OnboardingContent />
    </Suspense>
  );
}
