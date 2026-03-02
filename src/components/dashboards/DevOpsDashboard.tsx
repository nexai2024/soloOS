'use client';

import { Server, GitBranch, Cloud, Link2, Github, ExternalLink } from 'lucide-react';

export default function DevOpsDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            DevOps Dashboard
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Deployment visibility without the complexity
          </p>
        </div>
      </div>

      {/* Integration Required State */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Server className="w-10 h-10 text-slate-400 dark:text-slate-500" />
          </div>

          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Connect Your Deployment Tools
          </h3>

          <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-8">
            Link your GitHub repositories and deployment services to see real-time deployment status,
            environment health, and deployment history all in one place.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
            <IntegrationCard
              icon={Github}
              title="GitHub"
              description="Connect repositories to track commits and PRs"
              comingSoon={false}
            />
            <IntegrationCard
              icon={Cloud}
              title="Vercel"
              description="Monitor deployments and preview environments"
              comingSoon={true}
            />
            <IntegrationCard
              icon={Server}
              title="Railway"
              description="Track services and deployment status"
              comingSoon={true}
            />
          </div>

          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6 max-w-lg mx-auto">
            <h4 className="font-medium text-slate-900 dark:text-white mb-3">
              What you&apos;ll see once connected:
            </h4>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2 text-left">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                Real-time deployment status across environments
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                Commit history linked to deployments
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                Environment health and uptime metrics
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
                Deployment rollback capabilities
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <GitBranch className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Link a Repository</h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Connect your GitHub repositories to automatically track commits, pull requests, and link them to your projects.
          </p>
          <button className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline">
            <Link2 className="h-4 w-4 mr-1" />
            Connect GitHub
            <ExternalLink className="h-3 w-3 ml-1" />
          </button>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Cloud className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Deployment Integrations</h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Connect Vercel, Railway, or other deployment platforms to monitor your deployments directly from SoloOS.
          </p>
          <span className="inline-flex items-center px-3 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 text-sm rounded-full">
            Coming Soon
          </span>
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
