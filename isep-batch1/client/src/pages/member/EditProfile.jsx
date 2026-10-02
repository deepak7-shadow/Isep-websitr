import React, { useEffect, useState } from 'react';
import { ArrowLeft, Camera, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getProfile, updateProfile } from '../../api/profile';
import SkillTags from '../../components/SkillTags';

const emptyProfile = {
  fullName: '',
  branch: '',
  year: '',
  bio: '',
  skills: [],
  github: '',
  linkedin: '',
  portfolio: '',
  profilePhoto: '',
};

export default function EditProfile({ onBack }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      const userId = user?._id || user?.id;
      if (!userId) {
        setLoading(false);
        setError('Your member session could not be identified.');
        return;
      }

      try {
        const response = await getProfile(userId);
        const data = response?.data || response;

        if (mounted) {
          setProfile({
            ...emptyProfile,
            ...data,
            skills: Array.isArray(data?.skills) ? data.skills : [],
          });
        }
      } catch (requestError) {
        console.error('Failed to load profile:', requestError);
        if (mounted) setError(requestError?.response?.data?.message || 'Failed to load profile.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadProfile();
    return () => { mounted = false; };
  }, [user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setProfile((previous) => ({ ...previous, [name]: value }));
    setMessage('');
    setError('');
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setError('Profile photo must be 3 MB or smaller.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProfile((previous) => ({ ...previous, profilePhoto: reader.result }));
      setError('');
      setMessage('Photo selected. Save your profile to keep it.');
    };
    reader.onerror = () => setError('Could not read the selected image.');
    reader.readAsDataURL(file);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const response = await updateProfile({
        fullName: profile.fullName,
        branch: profile.branch,
        year: profile.year,
        bio: profile.bio,
        skills: profile.skills,
        github: profile.github,
        linkedin: profile.linkedin,
        portfolio: profile.portfolio,
        profilePhoto: profile.profilePhoto,
      });

      const savedProfile = response?.data;
      if (savedProfile) {
        setProfile((previous) => ({
          ...previous,
          ...savedProfile,
          skills: Array.isArray(savedProfile.skills) ? savedProfile.skills : previous.skills,
        }));
      }

      setMessage(response?.message || 'Profile updated successfully.');
    } catch (requestError) {
      console.error('Failed to update profile:', requestError);
      setError(requestError?.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const goBack = () => {
    if (typeof onBack === 'function') onBack();
    else window.location.href = '/profile';
  };

  if (loading) {
    return <PageShell><LoadingState text="Loading your profile..." /></PageShell>;
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-4xl">
        <button
          type="button"
          onClick={goBack}
          className="mb-6 inline-flex items-center gap-2 text-sm text-[#a3a1a8] transition hover:text-[#f3be65]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Profile
        </button>

        <div className="mb-8">
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#f3be65]">Member Workspace</span>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Edit Profile</h1>
          <p className="mt-2 text-sm text-[#a3a1a8]">Keep your ISEP member profile and professional links up to date.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-7 rounded-3xl border border-[#f3be65]/15 bg-[#1b1b1e] p-5 shadow-2xl sm:p-8">
          <section className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-[#131316] p-5 sm:flex-row sm:items-center">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-[#f3be65]/30 bg-[#f3be65]/10">
              {profile.profilePhoto ? (
                <img src={profile.profilePhoto} alt={profile.fullName || 'Profile'} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-[#f3be65]">
                  {(profile.fullName || 'M').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1">
              <h2 className="font-semibold">Profile Photo</h2>
              <p className="mt-1 text-xs leading-5 text-[#a3a1a8]">Choose a JPG, PNG, WEBP or GIF image up to 3 MB.</p>
              <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#f3be65]/30 bg-[#f3be65]/10 px-4 py-2.5 text-sm font-semibold text-[#f3be65] transition hover:bg-[#f3be65]/15">
                <Camera className="h-4 w-4" />
                Change Photo
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </label>
            </div>
          </section>

          <section className="grid gap-5 md:grid-cols-2">
            <Field label="Name" name="fullName" value={profile.fullName} onChange={handleChange} required />
            <Field label="Branch" name="branch" value={profile.branch} onChange={handleChange} placeholder="e.g. CSE" />
            <Field label="Year" name="year" value={profile.year} onChange={handleChange} placeholder="e.g. 2nd Year" />
            <Field label="GitHub" name="github" type="url" value={profile.github} onChange={handleChange} placeholder="https://github.com/..." />
            <Field label="LinkedIn" name="linkedin" type="url" value={profile.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/..." />
            <Field label="Portfolio URL" name="portfolio" type="url" value={profile.portfolio} onChange={handleChange} placeholder="https://..." />
          </section>

          <section>
            <label className="mb-2 block text-sm font-medium">About Me</label>
            <textarea
              name="bio"
              value={profile.bio}
              onChange={handleChange}
              rows={5}
              maxLength={1000}
              placeholder="Tell other members about yourself, your interests and what you build."
              className="w-full resize-none rounded-2xl border border-white/10 bg-[#131316] px-4 py-3 text-sm text-[#e4e1e5] outline-none transition placeholder:text-[#77757c] focus:border-[#f3be65]/60"
            />
            <p className="mt-1 text-right text-[11px] text-[#77757c]">{profile.bio.length}/1000</p>
          </section>

          <section>
            <label className="mb-3 block text-sm font-medium">Skills</label>
            <SkillTags
              skills={profile.skills}
              onChange={(skills) => setProfile((previous) => ({ ...previous, skills }))}
            />
          </section>

          {(message || error) && (
            <div className={`rounded-xl border px-4 py-3 text-sm ${error ? 'border-red-400/20 bg-red-400/10 text-red-300' : 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'}`}>
              {error || message}
            </div>
          )}

          <div className="flex justify-end border-t border-white/10 pt-6">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-[#f3be65] px-6 py-3 text-sm font-semibold text-[#131316] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </PageShell>
  );
}

function Field({ label, name, value, onChange, type = 'text', placeholder = '', required = false }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">{label}</label>
      <input
        type={type}
        name={name}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-white/10 bg-[#131316] px-4 py-3 text-sm text-[#e4e1e5] outline-none transition placeholder:text-[#77757c] focus:border-[#f3be65]/60"
      />
    </div>
  );
}

function PageShell({ children }) {
  return <div className="min-h-screen bg-[#131316] px-4 py-8 text-[#e4e1e5] sm:px-6 sm:py-10">{children}</div>;
}

function LoadingState({ text }) {
  return <div className="mx-auto max-w-5xl py-20 text-center text-sm text-[#a3a1a8]">{text}</div>;
}
