'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { ArrowLeft, Upload, Save, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import {
  fetchChildProfileById,
  updateChildProfile,
  type ChildProfile,
  type UpdateChildProfilePayload,
} from '@/lib/db/child-profiles';
import { useAuth } from '@/hooks/use-auth';

export default function EditProfilePage() {
  const router = useRouter();
  const params = useParams();
  const profileId = params.id as string;
  const { user, loading: authLoading } = useAuth();

  // Form state
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'boy' | 'girl' | ''>('');
  const [birthday, setBirthday] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [hairColor, setHairColor] = useState('');
  const [eyeColor, setEyeColor] = useState('');
  const [skinTone, setSkinTone] = useState('');
  const [otherFeatures, setOtherFeatures] = useState('');
  const [specialTraits, setSpecialTraits] = useState('');
  const [favoriteThing, setFavoriteThing] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [error, setError] = useState('');

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (authLoading || !user) return;

      try {
        setIsLoading(true);
        setError('');

        const profile = await fetchChildProfileById(profileId);
        if (!profile) {
          router.push('/dashboard');
          return;
        }

        // Populate form with existing data
        setName(profile.name || '');
        setGender(profile.gender || '');
        setBirthday(profile.birthday || '');
        setAvatarUrl(profile.avatar_url || '');

        // Appearance data
        if (profile.appearance) {
          setHairColor(profile.appearance.hairColor || '');
          setEyeColor(profile.appearance.eyeColor || '');
          setSkinTone(profile.appearance.skinTone || '');
          setOtherFeatures(profile.appearance.otherFeatures || '');
        }

        // Special traits
        setSpecialTraits(profile.special_traits || '');
        setFavoriteThing(profile.favorite_thing || '');
      } catch (e) {
        console.error('Error loading profile:', e);
        setError('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [profileId, router, user, authLoading]);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/sign-in');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSaving) return;
    setIsSaving(true);
    setError('');

    try {
      const updatePayload: UpdateChildProfilePayload = {
        id: profileId,
        name,
        gender: gender || undefined,
        birthday: birthday || undefined,
        avatar_url: avatarUrl || undefined,
        appearance: {
          hairColor: hairColor || undefined,
          eyeColor: eyeColor || undefined,
          skinTone: skinTone || undefined,
          otherFeatures: otherFeatures || undefined,
        },
        special_traits: specialTraits || undefined,
        favorite_thing: favoriteThing || undefined,
      };

      await updateChildProfile(updatePayload);

      // Show success message
      setSaveMessage('Profile updated successfully!');
      setTimeout(() => {
        router.push(`/profile/${profileId}`);
      }, 1500);
    } catch (e) {
      console.error('Error saving profile:', e);
      setError(e instanceof Error ? e.message : 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle real photo upload using the uploadChildPhoto function
  const handlePhotoUpload = async () => {
    // Create a file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/jpg,image/png,image/webp';

    input.onchange = async e => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        setError('');
        // Use the uploadChildPhoto function which handles the upload and updates the profile
        const { uploadChildPhoto } = await import('@/lib/db/child-profiles');
        const uploadedUrl = await uploadChildPhoto(profileId, file);
        setAvatarUrl(uploadedUrl);
      } catch (err) {
        console.error('Upload error:', err);
        setError(err instanceof Error ? err.message : 'Failed to upload photo');
      }
    };

    input.click();
  };

  const handleRemovePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAvatarUrl('');
  };

  if (authLoading || isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-[#FFF8E8]'>
        <div className='text-lg text-gray-600 nunito-font'>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen bg-[#FFF8E8] p-6'>
        <div className='text-red-600 nunito-font mb-4'>{error}</div>
        <Link href='/dashboard' className='text-blue-600 underline nunito-font'>
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className='flex flex-col min-h-screen bg-[#FFF8E8]'>
      {/* Header */}
      <header className='p-4 flex items-center justify-between'>
        <Link href={`/profile/${profileId}`} className='text-gray-800'>
          <ArrowLeft size={24} />
        </Link>
        <h1 className='text-xl font-bold text-gray-900'>Edit Profile</h1>
        <div className='w-6'></div> {/* Empty space for balance */}
      </header>

      {/* Edit form */}
      <main className='flex-1 p-6 pb-20'>
        <form onSubmit={handleSubmit} className='space-y-6 max-w-md mx-auto'>
          {/* Success/Error messages */}
          {saveMessage && (
            <div className='p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg nunito-font text-sm'>
              {saveMessage}
            </div>
          )}
          {error && (
            <div className='p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg nunito-font text-sm'>
              {error}
            </div>
          )}

          {/* Profile photo */}
          <div className='flex flex-col items-center mb-6'>
            <div
              className='w-32 h-32 rounded-full flex items-center justify-center mb-2 overflow-hidden cursor-pointer bg-gradient-to-br from-yellow-200 to-orange-200'
              onClick={handlePhotoUpload}
            >
              {avatarUrl ? (
                <div className='relative w-full h-full'>
                  <Image
                    src={avatarUrl}
                    alt={name}
                    width={128}
                    height={128}
                    className='object-cover w-full h-full'
                  />
                  <button
                    type='button'
                    onClick={handleRemovePhoto}
                    className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600'
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <div className='flex flex-col items-center'>
                  <Upload size={24} className='text-white mb-2' />
                  <span className='text-white text-sm nunito-font'>
                    Add Photo
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Basic information */}
          <div className='space-y-4'>
            <div>
              <label
                htmlFor='name'
                className='block text-gray-800 nunito-font font-bold mb-2'
              >
                Name
              </label>
              <input
                id='name'
                type='text'
                value={name}
                onChange={e => setName(e.target.value)}
                className='w-full px-4 py-3 rounded-lg border-2 border-yellow-200 focus:border-yellow-400 focus:outline-none nunito-font'
                required
                disabled={isSaving}
              />
            </div>

            <div>
              <label className='block text-gray-800 nunito-font font-bold mb-2'>
                Gender
              </label>
              <div className='grid grid-cols-2 gap-4'>
                <button
                  type='button'
                  className={`py-3 px-4 rounded-lg border-2 ${
                    gender === 'boy'
                      ? 'bg-blue-100 border-blue-300'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => setGender('boy')}
                  disabled={isSaving}
                >
                  <span className='nunito-font'>Boy</span>
                </button>
                <button
                  type='button'
                  className={`py-3 px-4 rounded-lg border-2 ${
                    gender === 'girl'
                      ? 'bg-pink-100 border-pink-300'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => setGender('girl')}
                  disabled={isSaving}
                >
                  <span className='nunito-font'>Girl</span>
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor='birthday'
                className='block text-gray-800 nunito-font font-bold mb-2'
              >
                Birthday
              </label>
              <input
                id='birthday'
                type='date'
                value={birthday}
                onChange={e => setBirthday(e.target.value)}
                className='w-full px-4 py-3 rounded-lg border-2 border-yellow-200 focus:border-yellow-400 focus:outline-none nunito-font'
                disabled={isSaving}
              />
            </div>
          </div>

          {/* Appearance section */}
          <div className='space-y-4'>
            <h3 className='text-lg font-bold text-gray-900 nunito-font'>
              Appearance
            </h3>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label
                  htmlFor='hairColor'
                  className='block text-gray-800 nunito-font font-bold mb-2'
                >
                  Hair Color
                </label>
                <input
                  id='hairColor'
                  type='text'
                  value={hairColor}
                  onChange={e => setHairColor(e.target.value)}
                  className='w-full px-4 py-3 rounded-lg border-2 border-yellow-200 focus:border-yellow-400 focus:outline-none nunito-font'
                  placeholder='Brown, Blonde, etc.'
                  disabled={isSaving}
                />
              </div>

              <div>
                <label
                  htmlFor='eyeColor'
                  className='block text-gray-800 nunito-font font-bold mb-2'
                >
                  Eye Color
                </label>
                <input
                  id='eyeColor'
                  type='text'
                  value={eyeColor}
                  onChange={e => setEyeColor(e.target.value)}
                  className='w-full px-4 py-3 rounded-lg border-2 border-yellow-200 focus:border-yellow-400 focus:outline-none nunito-font'
                  placeholder='Blue, Green, etc.'
                  disabled={isSaving}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor='skinTone'
                className='block text-gray-800 nunito-font font-bold mb-2'
              >
                Skin Tone
              </label>
              <input
                id='skinTone'
                type='text'
                value={skinTone}
                onChange={e => setSkinTone(e.target.value)}
                className='w-full px-4 py-3 rounded-lg border-2 border-yellow-200 focus:border-yellow-400 focus:outline-none nunito-font'
                placeholder='Fair, Medium, Dark, etc.'
                disabled={isSaving}
              />
            </div>

            <div>
              <label
                htmlFor='otherFeatures'
                className='block text-gray-800 nunito-font font-bold mb-2'
              >
                Other Features
              </label>
              <textarea
                id='otherFeatures'
                value={otherFeatures}
                onChange={e => setOtherFeatures(e.target.value)}
                className='w-full px-4 py-3 rounded-lg border-2 border-yellow-200 focus:border-yellow-400 focus:outline-none nunito-font'
                rows={3}
                placeholder='Freckles, dimples, etc.'
                disabled={isSaving}
              />
            </div>
          </div>

          {/* Special traits section */}
          <div className='space-y-4'>
            <h3 className='text-lg font-bold text-gray-900 nunito-font'>
              Special Traits
            </h3>

            <div>
              <label
                htmlFor='specialTraits'
                className='block text-gray-800 nunito-font font-bold mb-2'
              >
                What makes them special?
              </label>
              <textarea
                id='specialTraits'
                value={specialTraits}
                onChange={e => setSpecialTraits(e.target.value)}
                className='w-full px-4 py-3 rounded-lg border-2 border-yellow-200 focus:border-yellow-400 focus:outline-none nunito-font'
                rows={4}
                placeholder='Their unique traits, what they love to do...'
                disabled={isSaving}
              />
            </div>

            <div>
              <label
                htmlFor='favoriteThing'
                className='block text-gray-800 nunito-font font-bold mb-2'
              >
                Favorite Thing
              </label>
              <input
                id='favoriteThing'
                type='text'
                value={favoriteThing}
                onChange={e => setFavoriteThing(e.target.value)}
                className='w-full px-4 py-3 rounded-lg border-2 border-yellow-200 focus:border-yellow-400 focus:outline-none nunito-font'
                placeholder='Teddy bear, dinosaurs, etc.'
                disabled={isSaving}
              />
            </div>
          </div>

          {/* Save button */}
          <button
            type='submit'
            disabled={isSaving}
            className='w-full py-3 px-6 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold rounded-lg transition-colors duration-300 nunito-font text-lg flex items-center justify-center disabled:opacity-70'
          >
            {isSaving ? (
              <>
                <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 mr-2'></div>
                Saving...
              </>
            ) : (
              <>
                <Save size={20} className='mr-2' />
                Save Changes
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
