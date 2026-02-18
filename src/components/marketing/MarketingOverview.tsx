'use client';

import { useState, useEffect } from 'react';
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
  Calendar,
  FileText,
  Mail,
  Share2,
  Users,
} from 'lucide-react';
import { fetchGet, fetchPost } from '@/lib/fetch';
import { useToast } from '@/contexts/ToastContext';
import { STATUS_COLORS } from '@/lib/marketing/constants';
import type { AdCampaignData, SocialPostData, NewsletterData } from '@/lib/marketing/types';

interface MarketingOverviewProps {
  onNavigate: (tab: 'newsletters' | 'social' | 'blog' | 'calendar') => void;
}

export default function MarketingOverview({ onNavigate }: MarketingOverviewProps) {
  const [campaigns, setCampaigns] = useState<AdCampaignData[]>([]);
  const [socialPosts, setSocialPosts] = useState<SocialPostData[]>([]);
  const [newsletters, setNewsletters] = useState<NewsletterData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState<'campaign' | 'social' | null>(null);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [generateForm, setGenerateForm] = useState({
    productName: '',
    productDescription: '',
    platform: 'TWITTER' as string,
    tone: 'casual' as string,
  });
  const toast = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [campaignsResult, socialResult, newslettersResult] = await Promise.all([
      fetchGet<AdCampaignData[]>('/api/campaigns'),
      fetchGet<SocialPostData[]>('/api/social-posts'),
      fetchGet<NewsletterData[]>('/api/newsletters'),
    ]);

    if (campaignsResult.ok) setCampaigns(campaignsResult.data);
    if (socialResult.ok) setSocialPosts(socialResult.data);
    if (newslettersResult.ok) setNewsletters(newslettersResult.data);
    setIsLoading(false);
  };

  const handleGenerate = async (type: 'campaign' | 'social') => {
    if (!generateForm.productName || !generateForm.productDescription) return;
    setIsGenerating(type);

    const url = type === 'campaign' ? '/api/campaigns/generate' : '/api/social-posts/generate';
    const result = await fetchPost<{ campaigns?: AdCampaignData[]; posts?: SocialPostData[] }>(url, {
      productName: generateForm.productName,
      productDescription: generateForm.productDescription,
      ...(type === 'social' && { platform: generateForm.platform, tone: generateForm.tone }),
    });

    if (result.ok) {
      if (type === 'campaign' && result.data.campaigns) {
        setCampaigns(prev => [...result.data.campaigns!, ...prev]);
      } else if (result.data.posts) {
        setSocialPosts(prev => [...result.data.posts!, ...prev]);
      }
      setShowGenerateModal(null);
      setGenerateForm({ productName: '', productDescription: '', platform: 'TWITTER', tone: 'casual' });
      toast.success(type === 'campaign' ? 'Campaigns generated' : 'Social posts generated');
    } else {
      toast.error(result.error);
    }
    setIsGenerating(null);
  };

  const getStatusColor = (status: string) =>
    STATUS_COLORS[status.toUpperCase()] || STATUS_COLORS.DRAFT;

  const getPlatformIcon = (platform: string) => {
    switch (platform.toUpperCase()) {
      case 'TWITTER': return <Twitter className="h-4 w-4" />;
      case 'LINKEDIN': return <Linkedin className="h-4 w-4" />;
      default: return <Send className="h-4 w-4" />;
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

  const totalReach = campaigns.reduce((sum, c) => sum + (c.resultClicks || 0), 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + (c.resultSignups || 0), 0);
  const activeCampaigns = campaigns.filter(c => c.status === 'ACTIVE').length;
  const conversionRate = totalReach > 0 ? ((totalConversions / totalReach) * 100).toFixed(2) : '0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            Marketing Overview
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Your marketing performance at a glance
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

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Clicks', value: totalReach.toLocaleString(), icon: Target, color: 'blue', trend: true },
          { label: 'Conversions', value: totalConversions.toString(), icon: Zap, color: 'green' },
          { label: 'Active Campaigns', value: activeCampaigns.toString(), icon: Megaphone, color: 'purple' },
          { label: 'Conversion Rate', value: `${conversionRate}%`, icon: Target, color: 'yellow' },
        ].map((metric) => (
          <div key={metric.label} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 bg-${metric.color}-50 dark:bg-${metric.color}-900/20 rounded-lg`}>
                <metric.icon className={`h-6 w-6 text-${metric.color}-600 dark:text-${metric.color}-400`} />
              </div>
              {metric.trend && <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />}
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{metric.value}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">{metric.label}</div>
          </div>
        ))}
      </div>

      {/* Quick access cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Newsletters', icon: Mail, count: newsletters.length, color: 'purple', tab: 'newsletters' as const },
          { label: 'Social Posts', icon: Share2, count: socialPosts.length, color: 'blue', tab: 'social' as const },
          { label: 'Blog Posts', icon: FileText, count: 0, color: 'emerald', tab: 'blog' as const },
          { label: 'Calendar', icon: Calendar, count: null, color: 'orange', tab: 'calendar' as const },
        ].map((card) => (
          <button
            key={card.label}
            onClick={() => onNavigate(card.tab)}
            className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors text-left"
          >
            <div className="flex items-center justify-between mb-2">
              <card.icon className={`h-5 w-5 text-${card.color}-600 dark:text-${card.color}-400`} />
              <ExternalLink className="h-4 w-4 text-slate-400" />
            </div>
            <div className="font-medium text-slate-900 dark:text-white">{card.label}</div>
            {card.count !== null && (
              <div className="text-sm text-slate-500 dark:text-slate-400">{card.count} items</div>
            )}
          </button>
        ))}
      </div>

      {/* Campaigns & Social Posts lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campaigns */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Campaigns</h3>
            <span className="text-sm text-slate-500">{campaigns.length} total</span>
          </div>
          {campaigns.length > 0 ? (
            <div className="divide-y divide-slate-200 dark:divide-slate-700 max-h-96 overflow-y-auto">
              {campaigns.slice(0, 5).map((campaign) => (
                <div key={campaign.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center space-x-3 mb-1">
                        <h4 className="font-semibold text-slate-900 dark:text-white">{campaign.name}</h4>
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

        {/* Social Posts */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Social Posts</h3>
            <span className="text-sm text-slate-500">{socialPosts.length} total</span>
          </div>
          {socialPosts.length > 0 ? (
            <div className="divide-y divide-slate-200 dark:divide-slate-700 max-h-96 overflow-y-auto">
              {socialPosts.slice(0, 5).map((post) => (
                <div key={post.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                      {getPlatformIcon(post.platform)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{post.platform}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                          {post.status.toLowerCase()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-900 dark:text-white line-clamp-2">{post.content}</p>
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

      {/* Newsletters */}
      {newsletters.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Newsletters</h3>
            <button
              onClick={() => onNavigate('newsletters')}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              View all
            </button>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {newsletters.slice(0, 3).map((newsletter) => (
              <div key={newsletter.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white mb-1">{newsletter.name}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{newsletter.subject}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(newsletter.status)}`}>
                      {newsletter.status.toLowerCase()}
                    </span>
                    {newsletter.recipientCount && (
                      <p className="text-xs text-slate-500 mt-1">{newsletter.recipientCount} recipients</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generate Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              {showGenerateModal === 'campaign' ? 'Generate Campaign Ideas' : 'Generate Social Posts'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Product Name</label>
                <input
                  type="text"
                  value={generateForm.productName}
                  onChange={(e) => setGenerateForm({ ...generateForm, productName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  placeholder="e.g., SoloOS"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Product Description</label>
                <textarea
                  value={generateForm.productDescription}
                  onChange={(e) => setGenerateForm({ ...generateForm, productDescription: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  rows={3}
                  placeholder="Describe your product..."
                />
              </div>
              {showGenerateModal === 'social' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Platform</label>
                    <select
                      value={generateForm.platform}
                      onChange={(e) => setGenerateForm({ ...generateForm, platform: e.target.value })}
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
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tone</label>
                    <select
                      value={generateForm.tone}
                      onChange={(e) => setGenerateForm({ ...generateForm, tone: e.target.value })}
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
                onClick={() => setShowGenerateModal(null)}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleGenerate(showGenerateModal)}
                disabled={isGenerating !== null || !generateForm.productName || !generateForm.productDescription}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating...</>
                ) : (
                  <><Sparkles className="h-4 w-4 mr-2" />Generate</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
