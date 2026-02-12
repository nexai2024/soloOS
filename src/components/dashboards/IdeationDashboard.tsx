'use client';

import { useState, useEffect } from 'react';
import { Lightbulb, TrendingUp, Brain, Sparkles, Plus, Loader2, Waves, Settings, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { EmptyState } from '../onboarding/EmptyState';

interface Idea {
  id: string;
  title: string;
  description: string;
  status: string;
  aiScore: number | null;
  marketSizeScore: number | null;
  complexityScore: number | null;
  monetizationScore: number | null;
  personas: { id: string; name: string }[];
  problemStatements: { id: string }[];
  validationItems: { id: string; isCompleted: boolean }[];
  competitors: { id: string }[];
  createdAt: string;
}

interface UserProfile {
  niche: string | null;
  techStack: string[];
  interests: string[];
  experience: string | null;
  targetAudience: string | null;
}

export default function IdeationDashboard() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBlueOceanModal, setShowBlueOceanModal] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchIdeas();
    fetchProfile();
  }, []);

  const fetchIdeas = async () => {
    try {
      const response = await fetch('/api/ideas');
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/');
          return;
        }
        throw new Error('Failed to fetch ideas');
      }
      const data = await response.json();
      setIdeas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ideas');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data);
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PROMOTED':
        return 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400';
      case 'VALIDATING':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400';
      case 'RESEARCHING':
        return 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400';
      case 'ARCHIVED':
        return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400';
      default:
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400';
    }
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return 'text-slate-400 dark:text-slate-500';
    if (score >= 70) return 'text-green-600 dark:text-green-400';
    if (score >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  // Calculate metrics
  const totalIdeas = ideas.length;
  const validatedIdeas = ideas.filter(i => i.status === 'PROMOTED').length;
  const inProgressIdeas = ideas.filter(i => i.status === 'VALIDATING' || i.status === 'RESEARCHING').length;
  const avgScore = ideas.length > 0
    ? (ideas.reduce((sum, i) => sum + (i.aiScore || 0), 0) / ideas.filter(i => i.aiScore).length || 0).toFixed(1)
    : '0';

  const validationMetrics = [
    { label: 'Total Ideas', value: totalIdeas.toString(), icon: Lightbulb },
    { label: 'Promoted', value: validatedIdeas.toString(), icon: TrendingUp },
    { label: 'In Progress', value: inProgressIdeas.toString(), icon: Brain },
    { label: 'Avg. Score', value: avgScore, icon: Sparkles }
  ];

  const hasCompleteProfile = userProfile && (
    userProfile.niche ||
    userProfile.techStack.length > 0 ||
    userProfile.interests.length > 0
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
        <p className="text-red-700 dark:text-red-400">{error}</p>
        <button
          onClick={fetchIdeas}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (ideas.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <EmptyState
            icon={Lightbulb}
            title="No ideas yet"
            description="Start your journey by capturing your first business idea, or let AI generate Blue Ocean ideas tailored to your skills and interests."
            actionLabel="Create Your First Idea"
            onAction={() => router.push('/ideas/new')}
            tips={[
              "Start with a clear problem you want to solve",
              "Or use AI to generate Blue Ocean ideas based on your profile",
              "Define who your target users are (personas)",
              "Use AI scoring to evaluate market potential"
            ]}
          />
        </div>

        {/* Blue Ocean CTA for empty state */}
        <div className="bg-gradient-to-br from-cyan-600 to-blue-600 dark:from-cyan-700 dark:to-blue-700 rounded-xl p-6 text-white">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Waves className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-1">Generate Blue Ocean Ideas</h3>
              <p className="text-cyan-100 text-sm mb-4">
                Let AI analyze your skills and interests to generate unique, untapped business opportunities.
              </p>
              <button
                onClick={() => setShowBlueOceanModal(true)}
                className="px-4 py-2 bg-white text-cyan-600 rounded-lg font-medium hover:bg-cyan-50 transition-colors"
              >
                <Sparkles className="h-4 w-4 inline mr-2" />
                Generate Ideas
              </button>
            </div>
          </div>
        </div>

        {showBlueOceanModal && (
          <BlueOceanModal
            userProfile={userProfile}
            hasCompleteProfile={!!hasCompleteProfile}
            onClose={() => setShowBlueOceanModal(false)}
            onSuccess={(newIdeas) => {
              setIdeas(prev => [...newIdeas, ...prev]);
              setShowBlueOceanModal(false);
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Idea Pipeline
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Capture, validate, and promote ideas to projects
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowBlueOceanModal(true)}
            className="flex items-center px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors"
          >
            <Waves className="h-5 w-5 mr-2" />
            Blue Ocean
          </button>
          <Link
            href="/ideas/new"
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Idea
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {validationMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div
              key={index}
              className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                    {metric.value}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {metric.label}
                  </div>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Blue Ocean Banner */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl p-4 border border-cyan-200 dark:border-cyan-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Waves className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            <div>
              <p className="text-sm font-medium text-cyan-900 dark:text-cyan-100">
                Need fresh ideas?
              </p>
              <p className="text-xs text-cyan-700 dark:text-cyan-300">
                {hasCompleteProfile
                  ? "Generate AI-powered Blue Ocean ideas based on your profile"
                  : "Set up your profile to get personalized idea suggestions"}
              </p>
            </div>
          </div>
          {hasCompleteProfile ? (
            <button
              onClick={() => setShowBlueOceanModal(true)}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-sm rounded-lg font-medium transition-colors"
            >
              Generate
            </button>
          ) : (
            <Link
              href="/dashboard/settings"
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-sm rounded-lg font-medium transition-colors flex items-center"
            >
              <Settings className="h-4 w-4 mr-1" />
              Setup Profile
            </Link>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Active Ideas</h3>
          <Link
            href="/ideas"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            View All
          </Link>
        </div>
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {ideas.slice(0, 5).map((idea) => (
            <Link
              key={idea.id}
              href={`/ideas/${idea.id}`}
              className="block p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {idea.title}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(idea.status)}`}>
                      {idea.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1 mb-2">
                    {idea.description}
                  </p>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-slate-600 dark:text-slate-400">
                      Personas: <span className="font-medium">{idea.personas?.length || 0}</span>
                    </span>
                    <span className="text-slate-600 dark:text-slate-400">
                      Problems: <span className="font-medium">{idea.problemStatements?.length || 0}</span>
                    </span>
                    <span className="text-slate-600 dark:text-slate-400">
                      Validation: <span className="font-medium">
                        {idea.validationItems?.filter(v => v.isCompleted).length || 0}/{idea.validationItems?.length || 0}
                      </span>
                    </span>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className={`text-3xl font-bold ${getScoreColor(idea.aiScore)}`}>
                    {idea.aiScore ? idea.aiScore.toFixed(0) : '--'}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">AI Score</div>
                </div>
              </div>
              {idea.personas && idea.personas.length > 0 && (
                <div className="flex items-center space-x-2">
                  {idea.personas.slice(0, 3).map((persona) => (
                    <span
                      key={persona.id}
                      className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-xs font-medium"
                    >
                      {persona.name}
                    </span>
                  ))}
                  {idea.personas.length > 3 && (
                    <span className="text-xs text-slate-500">+{idea.personas.length - 3} more</span>
                  )}
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>

      {showBlueOceanModal && (
        <BlueOceanModal
          userProfile={userProfile}
          hasCompleteProfile={!!hasCompleteProfile}
          onClose={() => setShowBlueOceanModal(false)}
          onSuccess={(newIdeas) => {
            setIdeas(prev => [...newIdeas, ...prev]);
            setShowBlueOceanModal(false);
          }}
        />
      )}
    </div>
  );
}

function BlueOceanModal({
  userProfile,
  hasCompleteProfile,
  onClose,
  onSuccess,
}: {
  userProfile: UserProfile | null;
  hasCompleteProfile: boolean;
  onClose: () => void;
  onSuccess: (ideas: Idea[]) => void;
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    niche: userProfile?.niche || '',
    techStack: userProfile?.techStack?.join(', ') || '',
    interests: userProfile?.interests?.join(', ') || '',
    targetAudience: userProfile?.targetAudience || '',
    problemArea: '',
    constraints: '',
    count: 3,
  });

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/ideas/generate-blue-ocean', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          niche: form.niche || undefined,
          techStack: form.techStack ? form.techStack.split(',').map(s => s.trim()).filter(Boolean) : undefined,
          interests: form.interests ? form.interests.split(',').map(s => s.trim()).filter(Boolean) : undefined,
          targetAudience: form.targetAudience || undefined,
          problemArea: form.problemArea || undefined,
          constraints: form.constraints || undefined,
          count: form.count,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate ideas');
      }

      const data = await response.json();
      onSuccess(data.ideas);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate ideas');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
              <Waves className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Generate Blue Ocean Ideas
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                AI-powered unique business opportunities
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {!hasCompleteProfile && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Tip:</strong> Set up your profile in Settings to get more personalized ideas.
                You can still generate ideas by filling in the fields below.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Niche / Industry
              </label>
              <input
                type="text"
                value={form.niche}
                onChange={(e) => setForm({ ...form, niche: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                placeholder="e.g., SaaS, E-commerce, Developer Tools"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Target Audience
              </label>
              <input
                type="text"
                value={form.targetAudience}
                onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                placeholder="e.g., SMBs, Developers, Consumers"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Tech Stack (comma-separated)
            </label>
            <input
              type="text"
              value={form.techStack}
              onChange={(e) => setForm({ ...form, techStack: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              placeholder="e.g., React, Node.js, PostgreSQL, Python"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Interests (comma-separated)
            </label>
            <input
              type="text"
              value={form.interests}
              onChange={(e) => setForm({ ...form, interests: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              placeholder="e.g., AI/ML, Productivity, Fintech, Health"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Problem Area to Explore (optional)
            </label>
            <input
              type="text"
              value={form.problemArea}
              onChange={(e) => setForm({ ...form, problemArea: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              placeholder="e.g., Remote team collaboration, Personal finance for freelancers"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Constraints / Requirements (optional)
            </label>
            <textarea
              value={form.constraints}
              onChange={(e) => setForm({ ...form, constraints: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              placeholder="e.g., Must be buildable solo, Low upfront costs, B2B focus"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Number of Ideas
            </label>
            <select
              value={form.count}
              onChange={(e) => setForm({ ...form, count: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            >
              <option value={1}>1 idea</option>
              <option value={3}>3 ideas</option>
              <option value={5}>5 ideas</option>
            </select>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Ideas
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
