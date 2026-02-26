'use client';

import { Check, Circle, ArrowRight } from 'lucide-react';

const stages = ["PLANNING", "BUILDING", "TESTING", "DEPLOYED"];

interface DeploymentsPanelProps {
  project: {
    id: string;
    status: string;
  };
  hasProduct: boolean;
  productId?: string | null;
  productSlug?: string | null;
}

export default function DeploymentsPanel({
  project,
  hasProduct,
  productId,
  productSlug,
}: DeploymentsPanelProps) {
  const currentIndex = stages.indexOf(project.status);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Deployments</h3>

      {/* Status Pipeline */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">Deployment Pipeline</div>
        <div className="flex items-center justify-between">
          {stages.map((stage, i) => {
            const isComplete = currentIndex > i || (project.status === 'COMPLETED' && i <= stages.length - 1);
            const isCurrent = project.status === stage;
            return (
              <div key={stage} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isComplete ? 'bg-emerald-500 text-white' :
                    isCurrent ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-900/30' :
                    'bg-slate-200 dark:bg-slate-700 text-slate-400'
                  }`}>
                    {isComplete ? <Check className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                  </div>
                  <span className={`text-xs mt-2 font-medium ${
                    isCurrent ? 'text-indigo-600 dark:text-indigo-400' :
                    isComplete ? 'text-emerald-600 dark:text-emerald-400' :
                    'text-slate-400 dark:text-slate-500'
                  }`}>
                    {stage}
                  </span>
                </div>
                {i < stages.length - 1 && (
                  <ArrowRight className={`w-5 h-5 mx-4 ${isComplete ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Extra statuses */}
        {!stages.includes(project.status) && (
          <div className="mt-4 text-center">
            <span className="px-3 py-1 text-sm font-medium rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
              Current: {project.status}
            </span>
          </div>
        )}
      </div>

      {/* Product Link */}
      {hasProduct && productId && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Product Page</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Your product has a public-facing page</div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <a
                href={`/products/${productId}`}
                className="text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Manage product
              </a>
              {productSlug && (
                <a
                  href={`/p/${productSlug}`}
                  className="text-slate-600 dark:text-slate-400 hover:underline"
                >
                  View public page
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {!hasProduct && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Enable a Product to get a public landing page, waitlist, and changelog.
          </p>
        </div>
      )}
    </div>
  );
}
