'use client';

import { Wrench, AlertCircle, MessageCircle, Bug, HeadphonesIcon, ExternalLink, Link2 } from 'lucide-react';

export default function OpsDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Ops & Support
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Fewer fires, faster fixes with auto-linked tracking
          </p>
        </div>
      </div>

      {/* Integration Required State */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Wrench className="w-10 h-10 text-slate-400 dark:text-slate-500" />
          </div>

          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Connect Your Support & Monitoring Tools
          </h3>

          <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-8">
            Link your error tracking and support tools to see incidents, errors, and support tickets
            all connected to your features and deployments.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
            <IntegrationCard
              icon={Bug}
              title="Sentry"
              description="Track errors and exceptions in real-time"
              comingSoon={true}
            />
            <IntegrationCard
              icon={HeadphonesIcon}
              title="Intercom"
              description="Manage support conversations"
              comingSoon={true}
            />
            <IntegrationCard
              icon={AlertCircle}
              title="PagerDuty"
              description="Monitor incidents and on-call"
              comingSoon={true}
            />
          </div>

          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6 max-w-lg mx-auto">
            <h4 className="font-medium text-slate-900 dark:text-white mb-3">
              What you&apos;ll see once connected:
            </h4>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2 text-left">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                Active incidents linked to deployments
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                Error trends correlated with releases
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                Support tickets connected to features
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                Response time and resolution metrics
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <Bug className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Error Tracking</h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Connect Sentry or similar tools to automatically track errors and link them to your deployments and features.
          </p>
          <span className="inline-flex items-center px-3 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 text-sm rounded-full">
            Coming Soon
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <MessageCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Support Integration</h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Connect Intercom, Crisp, or other support tools to see customer conversations linked to your product.
          </p>
          <span className="inline-flex items-center px-3 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 text-sm rounded-full">
            Coming Soon
          </span>
        </div>
      </div>

      {/* Manual Incident Logging */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-6 border border-slate-200 dark:border-slate-600">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-white dark:bg-slate-600 rounded-xl shadow-sm">
            <AlertCircle className="h-6 w-6 text-slate-600 dark:text-slate-300" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
              Need to log an incident manually?
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              While we work on integrations, you can still track incidents by creating tasks
              in your projects with the &quot;incident&quot; tag.
            </p>
            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors">
                Create Incident Task
              </button>
              <a href="#" className="text-sm text-slate-600 dark:text-slate-400 hover:underline flex items-center">
                Learn more
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function IntegrationCard({
  icon: Icon,
  title,
  description,
  comingSoon,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  comingSoon: boolean;
}) {
  return (
    <div className={`p-4 rounded-xl border ${
      comingSoon
        ? 'border-dashed border-slate-300 dark:border-slate-600 opacity-60'
        : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 cursor-pointer'
    } transition-colors`}>
      <Icon className="h-8 w-8 text-slate-600 dark:text-slate-400 mx-auto mb-3" />
      <h4 className="font-medium text-slate-900 dark:text-white text-sm mb-1">{title}</h4>
      <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
      {comingSoon && (
        <span className="inline-block mt-2 px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-xs rounded">
          Coming Soon
        </span>
      )}
    </div>
  );
}
