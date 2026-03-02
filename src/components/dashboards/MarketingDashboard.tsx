'use client';

import { useState } from 'react';
import type { MarketingTab } from '@/lib/marketing/types';
import { MarketingProvider } from '@/components/marketing/MarketingProvider';
import MarketingSubNav from '@/components/marketing/MarketingSubNav';
import MarketingOverview from '@/components/marketing/MarketingOverview';
import NewsletterHub from '@/components/marketing/newsletters/NewsletterHub';
import SocialHub from '@/components/marketing/social/SocialHub';
import BlogHub from '@/components/marketing/blog/BlogHub';
import ContentCalendar from '@/components/marketing/calendar/ContentCalendar';
import AnalyticsDashboard from '@/components/marketing/analytics/AnalyticsDashboard';

export default function MarketingDashboard() {
  const [activeTab, setActiveTab] = useState<MarketingTab>('overview');

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':
        return <MarketingOverview onNavigate={setActiveTab} />;
      case 'newsletters':
        return <NewsletterHub />;
      case 'social':
        return <SocialHub />;
      case 'blog':
        return <BlogHub />;
      case 'calendar':
        return <ContentCalendar />;
      case 'analytics':
        return <AnalyticsDashboard />;
      default:
        return <MarketingOverview onNavigate={setActiveTab} />;
    }
  };

  return (
    <MarketingProvider>
      <div>
        <MarketingSubNav activeTab={activeTab} onTabChange={setActiveTab} />
        {renderTab()}
      </div>
    </MarketingProvider>
  );
}
