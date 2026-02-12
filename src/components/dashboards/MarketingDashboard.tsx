'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Megaphone,
  TrendingUp,
  Target,
  Zap,
  Plus,
  ExternalLink,
  Loader2,
  Sparkles,
  Twitter,
  Linkedin,
  Send,
  Calendar
} from 'lucide-react';
import { EmptyState } from '../onboarding/EmptyState';

interface Campaign {
  id: string;
  name: string;
  platform: string;
  status: string;
  budgetCents: number | null;
  spendCents: number | null;
  resultClicks: number | null;
  resultSignups: number | null;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
}

interface SocialPost {
  id: string;
  platform: string;
  content: string;
  status: string;
  scheduledFor: string | null;
  publishedAt: string | null;
  createdAt: string;
}

interface Newsletter {
  id: string;
  name: string;
  subject: string;
  status: string;
  audienceType: string;
  scheduledFor: string | null;
  sentAt: string | null;
  recipientCount: number | null;
  createdAt: string;
}

export default function MarketingDashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState<'campaign' | 'social' | null>(null);
  const [generateForm, setGenerateForm] = useState({
    productName: '',
    productDescription: '',
    platform: 'TWITTER' as string,
    tone: 'casual' as string,
  });
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [campaignsRes, socialRes, newslettersRes] = await Promise.all([
        fetch('/api/campaigns'),
        fetch('/api/social-posts'),
        fetch('/api/newsletters'),
      ]);

      if (campaignsRes.status === 401 || socialRes.status === 401 || newslettersRes.status === 401) {
        router.push('/');
        return;
      }

      if (!campaignsRes.ok || !socialRes.ok || !newslettersRes.ok) {
        throw new Error('Failed to fetch marketing data');
      }

      const [campaignsData, socialData, newslettersData] = await Promise.all([
        campaignsRes.json(),
        socialRes.json(),
        newslettersRes.json(),
      ]);

      setCampaigns(campaignsData);
      setSocialPosts(socialData);
      setNewsletters(newslettersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateCampaigns = async () => {
    if (!generateForm.productName || !generateForm.productDescription) return;

    setIsGenerating('campaign');
    try {
      const response = await fetch('/api/campaigns/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: generateForm.productName,
          productDescription: generateForm.productDescription,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate campaigns');

      const data = await response.json();
      setCampaigns(prev => [...data.campaigns, ...prev]);
      setShowGenerateModal(null);
      setGenerateForm({ productName: '', productDescription: '', platform: 'TWITTER', tone: 'casual' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate');
    } finally {
      setIsGenerating(null);
    }
  };

  const handleGenerateSocialPosts = async () => {
    if (!generateForm.productName || !generateForm.productDescription) return;

    setIsGenerating('social');
    try {
      const response = await fetch('/api/social-posts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: generateForm.productName,
          productDescription: generateForm.productDescription,
          platform: generateForm.platform,
          tone: generateForm.tone,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate social posts');

      const data = await response.json();
      setSocialPosts(prev => [...data.posts, ...prev]);
      setShowGenerateModal(null);
      setGenerateForm({ productName: '', productDescription: '', platform: 'TWITTER', tone: 'casual' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate');
    } finally {
      setIsGenerating(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
      case 'PUBLISHED':
      case 'SENT':
        return 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400';
      case 'SCHEDULED':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400';
      case 'DRAFT':
        return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400';
      case 'PAUSED':
      case 'ENDED':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400';
      default:
        return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toUpperCase()) {
      case 'TWITTER':
        return <Twitter className="h-4 w-4" />;
      case 'LINKEDIN':
        return <Linkedin className="h-4 w-4" />;
      default:
        return <Send className="h-4 w-4" />;
    }
  };

  const formatCurrency = (cents: number | null) => {
    if (cents === null) return '$0';
    return `$${(cents / 100).toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 text-red-500">
        <p>Error: {error}</p>
        <button
          onClick={() => { setError(null); setIsLoading(true); fetchData(); }}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  const hasNoData = campaigns.length === 0 && socialPosts.length === 0 && newsletters.length === 0;

  if (hasNoData) {
    return (
      <div className="space-y-6">
        <EmptyState
          icon={Megaphone}
          title="Start Your Marketing Journey"
          description="Create campaigns, schedule social posts, and send newsletters to grow your audience. Use AI to generate content ideas instantly."
          actionLabel="Generate Campaign Ideas"
          onAction={() => setShowGenerateModal('campaign')}
          tips={[
            "Use AI to generate campaign ideas based on your product",
            "Schedule social posts across multiple platforms",
            "Track campaign performance and conversions",
            "Build and nurture your audience with newsletters"
          ]}
        />

        {showGenerateModal && (
          <GenerateModal
            type={showGenerateModal}
            form={generateForm}
            setForm={setGenerateForm}
            isGenerating={isGenerating}
            onGenerate={showGenerateModal === 'campaign' ? handleGenerateCampaigns : handleGenerateSocialPosts}
            onClose={() => setShowGenerateModal(null)}
          />
        )}
      </div>
    );
  }

  // Calculate metrics
  const totalReach = campaigns.reduce((sum, c) => sum + (c.resultClicks || 0), 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + (c.resultSignups || 0), 0);
  const activeCampaigns = campaigns.filter(c => c.status === 'ACTIVE').length;
  const conversionRate = totalReach > 0 ? ((totalConversions / totalReach) * 100).toFixed(2) : '0';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Marketing & Launch
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Ship loud with campaigns, social posts, and newsletters
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowGenerateModal('social')}
            className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            <Sparkles className="h-5 w-5 mr-2" />
            Generate Posts
          </button>
          <button
            onClick={() => setShowGenerateModal('campaign')}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Campaign
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            {totalReach.toLocaleString()}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Total Clicks
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Zap className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            {totalConversions}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Conversions
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Megaphone className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            {activeCampaigns}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Active Campaigns
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <Target className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            {conversionRate}%
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Conversion Rate
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Campaigns</h3>
            <span className="text-sm text-slate-500">{campaigns.length} total</span>
          </div>
          {campaigns.length > 0 ? (
            <div className="divide-y divide-slate-200 dark:divide-slate-700 max-h-96 overflow-y-auto">
              {campaigns.slice(0, 5).map((campaign) => (
                <div
                  key={campaign.id}
                  className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center space-x-3 mb-1">
                        <h4 className="font-semibold text-slate-900 dark:text-white">
                          {campaign.name}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                          {campaign.status.toLowerCase()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded text-xs">
                          {campaign.platform}
                        </span>
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          Budget: {formatCurrency(campaign.budgetCents)}
                        </span>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                      <ExternalLink className="h-4 w-4 text-slate-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500">
              <Megaphone className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No campaigns yet</p>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Social Posts</h3>
            <span className="text-sm text-slate-500">{socialPosts.length} total</span>
          </div>
          {socialPosts.length > 0 ? (
            <div className="divide-y divide-slate-200 dark:divide-slate-700 max-h-96 overflow-y-auto">
              {socialPosts.slice(0, 5).map((post) => (
                <div
                  key={post.id}
                  className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                      {getPlatformIcon(post.platform)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          {post.platform}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                          {post.status.toLowerCase()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-900 dark:text-white line-clamp-2">
                        {post.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500">
              <Send className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No social posts yet</p>
            </div>
          )}
        </div>
      </div>

      {newsletters.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Newsletters</h3>
            <Calendar className="h-5 w-5 text-slate-400" />
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {newsletters.slice(0, 3).map((newsletter) => (
              <div
                key={newsletter.id}
                className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white mb-1">
                      {newsletter.name}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {newsletter.subject}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(newsletter.status)}`}>
                      {newsletter.status.toLowerCase()}
                    </span>
                    {newsletter.recipientCount && (
                      <p className="text-xs text-slate-500 mt-1">
                        {newsletter.recipientCount} recipients
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showGenerateModal && (
        <GenerateModal
          type={showGenerateModal}
          form={generateForm}
          setForm={setGenerateForm}
          isGenerating={isGenerating}
          onGenerate={showGenerateModal === 'campaign' ? handleGenerateCampaigns : handleGenerateSocialPosts}
          onClose={() => setShowGenerateModal(null)}
        />
      )}
    </div>
  );
}

function GenerateModal({
  type,
  form,
  setForm,
  isGenerating,
  onGenerate,
  onClose,
}: {
  type: 'campaign' | 'social';
  form: { productName: string; productDescription: string; platform: string; tone: string };
  setForm: (form: { productName: string; productDescription: string; platform: string; tone: string }) => void;
  isGenerating: string | null;
  onGenerate: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          {type === 'campaign' ? 'Generate Campaign Ideas' : 'Generate Social Posts'}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Product Name
            </label>
            <input
              type="text"
              value={form.productName}
              onChange={(e) => setForm({ ...form, productName: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              placeholder="e.g., SoloOS"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Product Description
            </label>
            <textarea
              value={form.productDescription}
              onChange={(e) => setForm({ ...form, productDescription: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              rows={3}
              placeholder="Describe your product and its key benefits..."
            />
          </div>

          {type === 'social' && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Platform
                </label>
                <select
                  value={form.platform}
                  onChange={(e) => setForm({ ...form, platform: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="TWITTER">Twitter/X</option>
                  <option value="LINKEDIN">LinkedIn</option>
                  <option value="THREADS">Threads</option>
                  <option value="BLUESKY">Bluesky</option>
                  <option value="MASTODON">Mastodon</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Tone
                </label>
                <select
                  value={form.tone}
                  onChange={(e) => setForm({ ...form, tone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="casual">Casual</option>
                  <option value="professional">Professional</option>
                  <option value="humorous">Humorous</option>
                  <option value="inspiring">Inspiring</option>
                </select>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onGenerate}
            disabled={isGenerating !== null || !form.productName || !form.productDescription}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
