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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center p-4">
      <div className="max-w-3xl w-full p-10 bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#4A295F] mb-3">Welcome to SideQuest</h1>
          <p className="text-black text-lg mb-4">Quick setup — tell us your preferences so we can personalize your feed.</p>

          {/* Step Indicator */}
          <div className="flex items-center gap-3 mt-6">
            <div className={`flex-1 h-2 rounded-full ${step >= 1 ? 'bg-[#4A295F]' : 'bg-gray-200'}`} />
            <div className={`flex-1 h-2 rounded-full ${step >= 2 ? 'bg-[#4A295F]' : 'bg-gray-200'}`} />
            <div className={`flex-1 h-2 rounded-full ${step >= 3 ? 'bg-[#4A295F]' : 'bg-gray-200'}`} />
          </div>
          <div className="flex justify-between text-xs mt-2 text-gray-500">
            <span>Step {step} of 3</span>
          </div>
        </div>

        <div className="space-y-8">
          {step === 1 && (
            <div className="bg-purple-50/50 p-6 rounded-xl border border-purple-100">
              <h3 className="text-xl font-semibold mb-4 text-[#4A295F]">Preferred search radius (km)</h3>
              <p className="text-black text-sm mb-4">How far are you willing to travel for activities?</p>
              <DualRangeSlider min={0} max={50} value={radius} onChange={(v) => setRadius(v)} />
              <div className="text-base font-medium text-black mt-4 text-center bg-white px-4 py-2 rounded-lg">
                Selected: {radius[0]}km — {radius[1]}km
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="bg-purple-50/50 p-6 rounded-xl border border-purple-100">
              <h3 className="text-xl font-semibold mb-4 text-[#4A295F]">Favorite categories</h3>
              <p className="text-black text-sm mb-4">Choose what interests you (select as many as you like)</p>
              <div className="flex flex-wrap gap-3">
                {categoriesList.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${selectedCategories.includes(cat)
                        ? 'bg-[#4A295F] text-white shadow-md scale-105'
                        : 'bg-white text-black border-2 border-gray-200 hover:border-[#4A295F] hover:shadow-sm'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              {selectedCategories.length > 0 && (
                <div className="mt-4 text-center text-sm font-medium text-[#4A295F] bg-white px-4 py-2 rounded-lg">
                  {selectedCategories.length} {selectedCategories.length === 1 ? 'category' : 'categories'} selected
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="bg-purple-50/50 p-6 rounded-xl border border-purple-100">
              <h3 className="text-xl font-semibold mb-4 text-[#4A295F]">Default sort preference</h3>
              <p className="text-black text-sm mb-4">How would you like to see activities by default?</p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-4 rounded-lg border-2 border-gray-200 bg-white text-black font-medium focus:border-[#4A295F] focus:outline-none transition-colors cursor-pointer"
              >
                <option value="distance-asc">📍 Distance (closest first)</option>
                <option value="distance-desc">📍 Distance (farthest first)</option>
                <option value="price-asc">💰 Price (low to high)</option>
                <option value="price-desc">💰 Price (high to low)</option>
                <option value="time-asc">⏱️ Time (short to long)</option>
                <option value="time-desc">⏱️ Time (long to short)</option>
                <option value="name-asc">🔤 Name (A → Z)</option>
              </select>
            </div>
          )}

          <div className="flex justify-between mt-8 gap-4">
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
              className="px-6 py-3 bg-white border-2 border-gray-300 text-black rounded-lg font-medium hover:bg-gray-50 hover:border-gray-400 transition-all cursor-pointer"
            >
              {step === 1 ? 'Skip' : '← Back'}
            </button>

            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-8 py-3 bg-[#4A295F] text-white rounded-lg font-semibold hover:bg-purple-900 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={saveAndFinish}
                className="px-8 py-3 bg-[#4A295F] text-white rounded-lg font-semibold hover:bg-purple-900 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                disabled={saving}
              >
                {saving ? 'Saving...' : '✓ Finish'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
