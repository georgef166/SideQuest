'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';
import { getProfileByUid, createOrUpdateProfile } from '@/lib/profileService';
import { ProfileFormData, UserProfile } from '@/lib/profileTypes';
import {
  VIBE_OPTIONS,
  BUDGET_OPTIONS,
  TRANSPORT_OPTIONS,
  ACCESSIBILITY_OPTIONS,
  CATEGORY_OPTIONS,
  ENERGY_OPTIONS,
  SOCIAL_OPTIONS,
} from '@/lib/profileTypes';
import {
  SectionHeader,
  FormField,
  CheckboxGroup,
  RadioGroup,
  PillSelect,
} from '@/components/ProfileCard';

export default function EditProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState<ProfileFormData>({
    profile: {
      legalName: '',
      preferredName: '',
      aboutMe: '',
      photoURL: '',
    },
    lifestyle: {
      location: '',
      education: '',
      work: '',
      questVibe: [],
      budgetComfort: 'moderate',
      transportation: [],
      dietaryPreferences: [],
    },
    preferences: {
      accessibilityNeeds: [],
      timePreference: undefined,
      favoriteCategories: [],
      energyLevel: undefined,
      socialComfort: [],
    },
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/');
      return;
    }

    loadProfile();
  }, [user, authLoading, router]);

  async function loadProfile() {
    try {
      setLoading(true);
      const profile = await getProfileByUid(user!.uid);
      if (profile) {
        setFormData({
          profile: {
            legalName: profile.profile?.legalName || '',
            preferredName: profile.profile?.preferredName || '',
            aboutMe: profile.profile?.aboutMe || '',
            photoURL: profile.profile?.photoURL || '',
          },
          lifestyle: {
            location: profile.lifestyle?.location || '',
            education: profile.lifestyle?.education || '',
            work: profile.lifestyle?.work || '',
            questVibe: profile.lifestyle?.questVibe || [],
            budgetComfort: profile.lifestyle?.budgetComfort || 'moderate',
            transportation: profile.lifestyle?.transportation || [],
            dietaryPreferences: profile.lifestyle?.dietaryPreferences || [],
          },
          preferences: {
            accessibilityNeeds: profile.preferences?.accessibilityNeeds || [],
            timePreference: profile.preferences?.timePreference,
            favoriteCategories: profile.preferences?.favoriteCategories || [],
            energyLevel: profile.preferences?.energyLevel,
            socialComfort: profile.preferences?.socialComfort || [],
          },
        });
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      showToast('error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }

  function handleFormChange<K extends keyof ProfileFormData>(
    section: K,
    field: string,
    value: any
  ) {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
    setUnsavedChanges(true);
    setErrors((prev) => ({ ...prev, [field]: '' }));
  }

  function validateForm(): boolean {
    const newErrors: Record<string, string> = {};

    if (!formData.profile.legalName || formData.profile.legalName.trim().length === 0) {
      newErrors.legalName = 'Legal name is required';
    }
    if (formData.profile.legalName && formData.profile.legalName.length < 2) {
      newErrors.legalName = 'Legal name must be at least 2 characters';
    }
    if (formData.profile.legalName && formData.profile.legalName.length > 50) {
      newErrors.legalName = 'Legal name must be less than 50 characters';
    }

    if (formData.profile.aboutMe && formData.profile.aboutMe.length > 160) {
      newErrors.aboutMe = 'About me must be less than 160 characters';
    }

    if (!formData.lifestyle.questVibe || formData.lifestyle.questVibe.length === 0) {
      newErrors.questVibe = 'Please select at least one quest vibe';
    }

    if (!formData.lifestyle.budgetComfort) {
      newErrors.budgetComfort = 'Budget comfort is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSave() {
    if (!validateForm()) {
      showToast('error', 'Please fix the errors above');
      return;
    }

    try {
      setSaving(true);
      await createOrUpdateProfile(user!.uid, formData, {
        displayName: user!.displayName || undefined,
        photoURL: user!.photoURL || undefined,
        email: user!.email || 'no-email',
      });
      setUnsavedChanges(false);
      showToast('success', 'Profile updated successfully');
      setTimeout(() => router.push('/profile'), 1500);
    } catch (err) {
      console.error('Failed to save profile:', err);
      showToast('error', 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    if (unsavedChanges) {
      if (
        confirm('You have unsaved changes. Are you sure you want to discard them?')
      ) {
        router.push('/profile');
      }
    } else {
      router.push('/profile');
    }
  }

  function showToast(type: 'success' | 'error', message: string) {
    setToastMessage({ type, message });
    setTimeout(() => setToastMessage(null), 3000);
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button
            onClick={handleCancel}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            Back
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Edit Profile</h1>
          <div className="w-12"></div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* About You Section */}
        <SectionHeader title="About You">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Legal Name"
              error={errors.legalName}
              required
            >
              <input
                type="text"
                value={formData.profile.legalName}
                onChange={(e) =>
                  handleFormChange('profile', 'legalName', e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your legal name"
              />
            </FormField>

            <FormField label="Preferred Name">
              <input
                type="text"
                value={formData.profile.preferredName || ''}
                onChange={(e) =>
                  handleFormChange('profile', 'preferredName', e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="How you'd like to be called"
              />
            </FormField>

            <div className="md:col-span-2">
              <FormField
                label="About Me"
                error={errors.aboutMe}
              >
                <textarea
                  value={formData.profile.aboutMe || ''}
                  onChange={(e) =>
                    handleFormChange('profile', 'aboutMe', e.target.value)
                  }
                  maxLength={160}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Tell us about yourself (max 160 characters)"
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.profile.aboutMe?.length || 0}/160 characters
                </p>
              </FormField>
            </div>
          </div>
        </SectionHeader>

        {/* Profile Photo Section */}
        <SectionHeader title="Profile Photo">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <div className="flex flex-col items-center">
                {formData.profile.photoURL ? (
                  <img
                    src={formData.profile.photoURL}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 mb-4"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                    <span className="text-gray-400 text-sm">No photo</span>
                  </div>
                )}
                <FormField label="Photo URL">
                  <input
                    type="url"
                    value={formData.profile.photoURL || ''}
                    onChange={(e) =>
                      handleFormChange('profile', 'photoURL', e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/photo.jpg"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Paste a URL to a publicly accessible image
                  </p>
                </FormField>
              </div>
            </div>
          </div>
        </SectionHeader>

        {/* My Lifestyle Section */}
        <SectionHeader title="My Lifestyle">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Where I Live">
              <input
                type="text"
                value={formData.lifestyle.location || ''}
                onChange={(e) =>
                  handleFormChange('lifestyle', 'location', e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="City, Province"
              />
            </FormField>

            <FormField label="Education">
              <input
                type="text"
                value={formData.lifestyle.education || ''}
                onChange={(e) =>
                  handleFormChange('lifestyle', 'education', e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="School or University"
              />
            </FormField>

            <FormField label="My Work">
              <input
                type="text"
                value={formData.lifestyle.work || ''}
                onChange={(e) =>
                  handleFormChange('lifestyle', 'work', e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Job title and company"
              />
            </FormField>

            <FormField
              label="Quest Vibe"
              error={errors.questVibe}
              required
            >
              <PillSelect
                options={VIBE_OPTIONS}
                selected={formData.lifestyle.questVibe}
                onChange={(selected) =>
                  handleFormChange('lifestyle', 'questVibe', selected)
                }
              />
            </FormField>

            <FormField
              label="Budget Comfort"
              required
            >
              <RadioGroup
                options={BUDGET_OPTIONS}
                selected={formData.lifestyle.budgetComfort}
                onChange={(value) =>
                  handleFormChange('lifestyle', 'budgetComfort', value)
                }
              />
            </FormField>

            <FormField label="Transportation">
              <CheckboxGroup
                options={TRANSPORT_OPTIONS}
                selected={formData.lifestyle.transportation || []}
                onChange={(selected) =>
                  handleFormChange('lifestyle', 'transportation', selected)
                }
              />
            </FormField>

            <div className="md:col-span-2">
              <FormField label="Dietary Preferences">
                <input
                  type="text"
                  value={formData.lifestyle.dietaryPreferences?.join(', ') || ''}
                  onChange={(e) =>
                    handleFormChange(
                      'lifestyle',
                      'dietaryPreferences',
                      e.target.value
                        .split(',')
                        .map((v) => v.trim())
                        .filter((v) => v.length > 0)
                    )
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., vegetarian, vegan, gluten-free (comma separated)"
                />
              </FormField>
            </div>
          </div>
        </SectionHeader>

        {/* My Preferences Section */}
        <SectionHeader title="My Preferences">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Accessibility Needs">
              <CheckboxGroup
                options={ACCESSIBILITY_OPTIONS}
                selected={formData.preferences.accessibilityNeeds || []}
                onChange={(selected) =>
                  handleFormChange('preferences', 'accessibilityNeeds', selected)
                }
              />
            </FormField>

            <FormField label="Time Preference">
              <RadioGroup
                options={[
                  { value: 'spontaneous', label: 'Spontaneous' },
                  { value: 'planned', label: 'Planned' },
                  { value: 'flexible', label: 'Flexible' },
                ]}
                selected={formData.preferences.timePreference}
                onChange={(value) =>
                  handleFormChange('preferences', 'timePreference', value)
                }
              />
            </FormField>

            <div className="md:col-span-2">
              <FormField label="Favorite Categories">
                <CheckboxGroup
                  options={CATEGORY_OPTIONS}
                  selected={formData.preferences.favoriteCategories || []}
                  onChange={(selected) =>
                    handleFormChange('preferences', 'favoriteCategories', selected)
                  }
                />
              </FormField>
            </div>

            <FormField label="Energy Level">
              <RadioGroup
                options={ENERGY_OPTIONS}
                selected={formData.preferences.energyLevel}
                onChange={(value) =>
                  handleFormChange('preferences', 'energyLevel', value)
                }
              />
            </FormField>

            <FormField label="Social Comfort">
              <CheckboxGroup
                options={SOCIAL_OPTIONS}
                selected={formData.preferences.socialComfort || []}
                onChange={(selected) =>
                  handleFormChange('preferences', 'socialComfort', selected)
                }
              />
            </FormField>
          </div>
        </SectionHeader>

        {/* Save/Cancel Buttons */}
        <div className="flex gap-4 mt-8 sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-4 sm:-mx-6 lg:-mx-8 sm:px-6 lg:px-8">
          <button
            onClick={handleCancel}
            disabled={saving}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 px-6 py-3 rounded-lg text-white font-medium ${
            toastMessage.type === 'success'
              ? 'bg-green-600'
              : 'bg-red-600'
          } shadow-lg`}
        >
          {toastMessage.type === 'success' ? 'Success' : 'Error'}: {toastMessage.message}
        </div>
      )}
    </div>
  );
}
