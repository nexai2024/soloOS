'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import OverviewDashboard from '@/components/dashboards/OverviewDashboard';
import IdeationDashboard from '@/components/dashboards/IdeationDashboard';
import PlanningDashboard from '@/components/dashboards/PlanningDashboard';
import DevOpsDashboard from '@/components/dashboards/DevOpsDashboard';
import MarketingDashboard from '@/components/dashboards/MarketingDashboard';
import UsersDashboard from '@/components/dashboards/UsersDashboard';
import OpsDashboard from '@/components/dashboards/OpsDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboarding } from '@/hooks/useOnboarding';
import { WelcomeModal } from '@/components/onboarding/WelcomeModal';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const [activeModule, setActiveModule] = useState('overview');
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { showWelcome, completeOnboarding, isLoading: onboardingLoading } = useOnboarding();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || onboardingLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const renderModule = () => {
    switch (activeModule) {
      case 'overview':
        return <OverviewDashboard />;
      case 'ideation':
        return <IdeationDashboard />;
      case 'planning':
        return <PlanningDashboard />;
      case 'devops':
        return <DevOpsDashboard />;
      case 'marketing':
        return <MarketingDashboard />;
      case 'users':
        return <UsersDashboard />;
      case 'ops':
        return <OpsDashboard />;
      default:
        return <OverviewDashboard />;
    }
  };

  return (
    <>
      {showWelcome && user && (
        <WelcomeModal
          userName={user.name}
          onComplete={completeOnboarding}
        />
      )}
      <DashboardLayout activeModule={activeModule} onModuleChange={setActiveModule}>
        {renderModule()}
      </DashboardLayout>
    </>
  );
}
