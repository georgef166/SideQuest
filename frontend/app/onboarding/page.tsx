"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DualRangeSlider from '@/components/DualRangeSlider';
import { useAuth } from '@/lib/useAuth';
import { saveUserPreferences, getUserPreferences } from '@/lib/preferences';
import { useToast } from '@/lib/toast';

const categoriesList = [
  'Food', 'Events', 'Outdoors', 'Arts', 'Music', 'Cafe', 'Bars', 'Active', 'Hidden Gems', 'Date Ideas', 'Shopping', 'Nightlife', 'Relaxation'
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { showToast } = useToast();

  const [step, setStep] = useState(1);
  const [radius, setRadius] = useState<[number, number]>([0, 10]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('distance-asc');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user && !loading) router.push('/');
  }, [user, loading]);

  useEffect(() => {
    // If user already has onboardingCompleted, skip
    if (!user) return;
    (async () => {
      const prefs = await getUserPreferences(user.uid);
      if (prefs && prefs.onboardingCompleted) {
        router.push('/');
      }
    })();
  }, [user]);

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
      router.push('/');
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
        <h1 className="page-title text-[#4A295F]">Welcome to SideQuest</h1>
        <p className="text-lg subtitle mt-2" style={{ fontWeight: 500, color: '#4B5563' }}>Quick setup — tell us your preferences so we can personalize your feed.</p>

        <div className="space-y-6">
          {step === 1 && (
            <div>
              <h3 className="font-semibold mb-2">Preferred search radius (km)</h3>
              <DualRangeSlider min={0} max={50} value={radius} onChange={(v) => setRadius(v)} />
              <div className="text-sm text-gray-600 mt-2">Selected: {radius[0]}km — {radius[1]}km</div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 className="font-semibold mb-2">Favorite categories</h3>
              <div className="flex flex-wrap gap-2">
                {categoriesList.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${selectedCategories.includes(cat) ? 'bg-[#4A295F] text-white' : 'bg-gray-100 text-gray-700'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 className="font-semibold mb-2">Default sort</h3>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full p-3 rounded border">
                <option value="distance-asc">Distance (closest)</option>
                <option value="distance-desc">Distance (farthest)</option>
                <option value="price-asc">Price (low to high)</option>
                <option value="price-desc">Price (high to low)</option>
                <option value="time-asc">Time (short to long)</option>
                <option value="time-desc">Time (long to short)</option>
                <option value="name-asc">Name (A → Z)</option>
              </select>
            </div>
          )}

          <div className="flex justify-between mt-4">
            <button
              onClick={async () => {
                if (step === 1) {
                  if (!user) return router.push('/');
                  // Mark onboarding completed even if user skips
                  await saveUserPreferences(user.uid, { onboardingCompleted: true });
                  router.push('/');
                } else {
                  setStep(step - 1);
                }
              }}
              className="px-4 py-2 bg-gray-100 rounded"
            >
              {step === 1 ? 'Skip' : 'Back'}
            </button>

            {step < 3 ? (
              <button onClick={() => setStep(step + 1)} className="px-4 py-2 bg-[#4A295F] text-white rounded">Next</button>
            ) : (
              <button onClick={saveAndFinish} className="px-4 py-2 bg-[#4A295F] text-white rounded" disabled={saving}>{saving ? 'Saving...' : 'Finish'}</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
