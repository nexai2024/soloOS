'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Code,
  Target,
  Sparkles,
  Save,
  Loader2,
  CheckCircle,
  ArrowLeft,
  Waves
} from 'lucide-react';
import Link from 'next/link';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  niche: string | null;
  techStack: string[];
  interests: string[];
  experience: string | null;
  targetAudience: string | null;
  bio: string | null;
}

const COMMON_TECH_STACKS = [
  'React', 'Next.js', 'Vue', 'Angular', 'Svelte',
  'Node.js', 'Python', 'Go', 'Rust', 'Java',
  'PostgreSQL', 'MongoDB', 'Redis', 'MySQL',
  'AWS', 'GCP', 'Vercel', 'Docker', 'Kubernetes',
  'TypeScript', 'GraphQL', 'REST APIs'
];

const COMMON_INTERESTS = [
  'AI/ML', 'Productivity', 'Fintech', 'Health Tech',
  'E-commerce', 'Developer Tools', 'EdTech', 'Social',
  'Climate Tech', 'Gaming', 'IoT', 'Blockchain',
  'No-code', 'Analytics', 'Security', 'Automation'
];

const COMMON_NICHES = [
  'SaaS', 'Developer Tools', 'E-commerce', 'Marketplaces',
  'Content/Media', 'Finance', 'Healthcare', 'Education',
  'Productivity', 'Marketing', 'HR/Recruiting', 'Real Estate'
];

const EXPERIENCE_LEVELS = [
  { value: 'BEGINNER', label: 'Beginner', description: 'Just starting out or learning' },
  { value: 'INTERMEDIATE', label: 'Intermediate', description: '1-3 years of experience' },
  { value: 'EXPERT', label: 'Expert', description: '3+ years, shipped multiple projects' },
];

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    name: '',
    niche: '',
    techStack: [] as string[],
    interests: [] as string[],
    experience: '',
    targetAudience: '',
    bio: '',
  });

  // Custom input states for adding new items
  const [customTech, setCustomTech] = useState('');
  const [customInterest, setCustomInterest] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/');
          return;
        }
        throw new Error('Failed to fetch profile');
      }
      const data = await response.json();
      setProfile(data);
      setForm({
        name: data.name || '',
        niche: data.niche || '',
        techStack: data.techStack || [],
        interests: data.interests || [],
        experience: data.experience || '',
        targetAudience: data.targetAudience || '',
        bio: data.bio || '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          niche: form.niche || null,
          techStack: form.techStack,
          interests: form.interests,
          experience: form.experience || null,
          targetAudience: form.targetAudience || null,
          bio: form.bio || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save profile');
      }

      const updated = await response.json();
      setProfile(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleTech = (tech: string) => {
    setForm(prev => ({
      ...prev,
      techStack: prev.techStack.includes(tech)
        ? prev.techStack.filter(t => t !== tech)
        : [...prev.techStack, tech]
    }));
  };

  const toggleInterest = (interest: string) => {
    setForm(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const addCustomTech = () => {
    if (customTech.trim() && !form.techStack.includes(customTech.trim())) {
      setForm(prev => ({
        ...prev,
        techStack: [...prev.techStack, customTech.trim()]
      }));
      setCustomTech('');
    }
  };

  const addCustomInterest = () => {
    if (customInterest.trim() && !form.interests.includes(customInterest.trim())) {
      setForm(prev => ({
        ...prev,
        interests: [...prev.interests, customInterest.trim()]
      }));
      setCustomInterest('');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  const profileCompleteness = [
    form.niche,
    form.techStack.length > 0,
    form.interests.length > 0,
    form.experience,
    form.targetAudience,
  ].filter(Boolean).length;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Profile Settings
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Set up your profile to get personalized Blue Ocean idea suggestions
        </p>
      </div>

      {/* Profile Completeness */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl p-6 mb-8 border border-cyan-200 dark:border-cyan-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Waves className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Profile Completeness
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Complete your profile for better AI idea suggestions
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
              {Math.round((profileCompleteness / 5) * 100)}%
            </div>
          </div>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all"
            style={{ width: `${(profileCompleteness / 5) * 100}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {saveSuccess && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6 flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          <p className="text-green-700 dark:text-green-300">Profile saved successfully!</p>
        </div>
      )}

      <div className="space-y-8">
        {/* Basic Info */}
        <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Basic Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={profile?.email || ''}
                disabled
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Bio (optional)
              </label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                placeholder="Tell us about yourself and your goals..."
              />
            </div>
          </div>
        </section>

        {/* Niche & Target */}
        <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Niche & Target Market</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Primary Niche / Industry
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {COMMON_NICHES.map((niche) => (
                  <button
                    key={niche}
                    onClick={() => setForm({ ...form, niche: form.niche === niche ? '' : niche })}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      form.niche === niche
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {niche}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={form.niche}
                onChange={(e) => setForm({ ...form, niche: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                placeholder="Or type your own niche..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Target Audience
              </label>
              <input
                type="text"
                value={form.targetAudience}
                onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                placeholder="e.g., Small businesses, Solo developers, Enterprise teams"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Experience Level
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {EXPERIENCE_LEVELS.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => setForm({ ...form, experience: form.experience === level.value ? '' : level.value })}
                    className={`p-4 rounded-lg border text-left transition-colors ${
                      form.experience === level.value
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="font-medium text-slate-900 dark:text-white">{level.label}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">{level.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Code className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Tech Stack</h2>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Select technologies you are comfortable building with:
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            {COMMON_TECH_STACKS.map((tech) => (
              <button
                key={tech}
                onClick={() => toggleTech(tech)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  form.techStack.includes(tech)
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {tech}
              </button>
            ))}
          </div>

          {/* Custom additions */}
          {form.techStack.filter(t => !COMMON_TECH_STACKS.includes(t)).length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {form.techStack.filter(t => !COMMON_TECH_STACKS.includes(t)).map((tech) => (
                <button
                  key={tech}
                  onClick={() => toggleTech(tech)}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium bg-green-600 text-white"
                >
                  {tech} ×
                </button>
              ))}
            </div>
          )}

          <div className="flex space-x-2">
            <input
              type="text"
              value={customTech}
              onChange={(e) => setCustomTech(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCustomTech()}
              className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              placeholder="Add custom technology..."
            />
            <button
              onClick={addCustomTech}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600"
            >
              Add
            </button>
          </div>
        </section>

        {/* Interests */}
        <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <Sparkles className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Interests & Passions</h2>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Select areas you are passionate about or want to explore:
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            {COMMON_INTERESTS.map((interest) => (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  form.interests.includes(interest)
                    ? 'bg-yellow-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>

          {/* Custom additions */}
          {form.interests.filter(i => !COMMON_INTERESTS.includes(i)).length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {form.interests.filter(i => !COMMON_INTERESTS.includes(i)).map((interest) => (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium bg-yellow-500 text-white"
                >
                  {interest} ×
                </button>
              ))}
            </div>
          )}

          <div className="flex space-x-2">
            <input
              type="text"
              value={customInterest}
              onChange={(e) => setCustomInterest(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCustomInterest()}
              className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              placeholder="Add custom interest..."
            />
            <button
              onClick={addCustomInterest}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600"
            >
              Add
            </button>
          </div>
        </section>

        {/* Save Button */}
        <div className="flex justify-end space-x-4">
          <Link
            href="/dashboard"
            className="px-6 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Cancel
          </Link>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Save Profile
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
