'use client';

import { ExternalLink, Megaphone, Mail, PenTool, BarChart3 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface MarketingPanelProps {
  product: {
    id: string;
    name: string;
    SocialPost?: { id: string; platform: string; status: string; content: string }[];
    AdCampaign?: { id: string; name: string; status: string; platform: string }[];
    BlogPost?: { id: string; title: string; status: string }[];
    NewsletterCampaign?: { id: string; name: string; status: string }[];
  };
}

export default function MarketingPanel({ product }: MarketingPanelProps) {
  const router = useRouter();
  const socialPosts = product.SocialPost || [];
  const adCampaigns = product.AdCampaign || [];
  const blogPosts = product.BlogPost || [];
  const newsletters = product.NewsletterCampaign || [];

  const sections = [
    {
      title: 'Social Posts',
      icon: <PenTool className="w-4 h-4" />,
      items: socialPosts.map(p => ({ id: p.id, label: `${p.platform}: ${p.content.slice(0, 50)}...`, status: p.status })),
      count: socialPosts.length,
    },
    {
      title: 'Ad Campaigns',
      icon: <BarChart3 className="w-4 h-4" />,
      items: adCampaigns.map(c => ({ id: c.id, label: `${c.platform}: ${c.name}`, status: c.status })),
      count: adCampaigns.length,
    },
    {
      title: 'Blog Posts',
      icon: <Megaphone className="w-4 h-4" />,
      items: blogPosts.map(b => ({ id: b.id, label: b.title, status: b.status })),
      count: blogPosts.length,
    },
    {
      title: 'Newsletters',
      icon: <Mail className="w-4 h-4" />,
      items: newsletters.map(n => ({ id: n.id, label: n.name, status: n.status })),
      count: newsletters.length,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Marketing</h3>
        <button onClick={() => router.push('/dashboard?module=marketing')} className="flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
          <ExternalLink className="w-4 h-4" /> Go to Marketing Module
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-3">
        {sections.map(s => (
          <div key={s.title} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
              {s.icon} {s.title}
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">{s.count}</div>
          </div>
        ))}
      </div>

      {/* Sections */}
      {sections.map(section => (
        section.items.length > 0 && (
          <div key={section.title} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
              {section.icon}
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{section.title}</span>
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {section.items.slice(0, 5).map(item => (
                <div key={item.id} className="px-4 py-2 flex items-center justify-between">
                  <span className="text-sm text-slate-700 dark:text-slate-300 truncate">{item.label}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">{item.status}</span>
                </div>
              ))}
            </div>
          </div>
        )
      ))}

      {sections.every(s => s.items.length === 0) && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 text-center">
          <Megaphone className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">No marketing content linked to this product yet.</p>
          <button onClick={() => router.push('/dashboard?module=marketing')} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
            Create marketing content
          </button>
        </div>
      )}
    </div>
  );
}
