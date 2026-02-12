"use client";

import { Users, AlertCircle, CheckSquare, Target, Sparkles, ArrowRight } from "lucide-react";

interface IdeaReadinessScoreProps {
  personasCount: number;
  problemsCount: number;
  validationCompleted: number;
  validationTotal: number;
  competitorsCount: number;
  hasAiScore: boolean;
  onNavigate?: (tab: string) => void;
}

interface ReadinessItem {
  id: string;
  label: string;
  current: number;
  target: number;
  icon: typeof Users;
  color: string;
  bgColor: string;
  action: string;
  tab: string;
}

export function IdeaReadinessScore({
  personasCount,
  problemsCount,
  validationCompleted,
  validationTotal,
  competitorsCount,
  hasAiScore,
  onNavigate
}: IdeaReadinessScoreProps) {
  const items: ReadinessItem[] = [
    {
      id: "personas",
      label: "Target Personas",
      current: personasCount,
      target: 2,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      action: "Add at least 2 personas",
      tab: "personas"
    },
    {
      id: "problems",
      label: "Problem Statements",
      current: problemsCount,
      target: 2,
      icon: AlertCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
      action: "Define at least 2 problems",
      tab: "problems"
    },
    {
      id: "validation",
      label: "Validation Tasks",
      current: validationCompleted,
      target: Math.max(validationTotal, 3),
      icon: CheckSquare,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      action: validationTotal === 0 ? "Add validation tasks" : `Complete ${validationTotal - validationCompleted} more tasks`,
      tab: "validation"
    },
    {
      id: "competitors",
      label: "Competitor Analysis",
      current: competitorsCount,
      target: 2,
      icon: Target,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
      action: "Research at least 2 competitors",
      tab: "competitors"
    },
    {
      id: "aiScore",
      label: "AI Scoring",
      current: hasAiScore ? 1 : 0,
      target: 1,
      icon: Sparkles,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
      action: "Run AI scoring analysis",
      tab: "overview"
    }
  ];

  // Calculate overall readiness
  const totalProgress = items.reduce((sum, item) => {
    const itemProgress = Math.min(item.current / item.target, 1);
    return sum + itemProgress;
  }, 0);
  const overallReadiness = Math.round((totalProgress / items.length) * 100);

  // Get status color and label
  const getStatusInfo = (readiness: number) => {
    if (readiness >= 100) return { color: "text-green-600", bgColor: "bg-green-100", label: "Ready to Promote" };
    if (readiness >= 75) return { color: "text-blue-600", bgColor: "bg-blue-100", label: "Almost Ready" };
    if (readiness >= 50) return { color: "text-yellow-600", bgColor: "bg-yellow-100", label: "In Progress" };
    return { color: "text-red-600", bgColor: "bg-red-100", label: "Needs Work" };
  };

  const statusInfo = getStatusInfo(overallReadiness);

  // Get incomplete items for action suggestions
  const incompleteItems = items.filter(item => item.current < item.target);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Header with overall score */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Idea Readiness</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </div>

        {/* Circular progress indicator */}
        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-slate-200 dark:text-slate-700"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${overallReadiness * 2.51} 251`}
                strokeLinecap="round"
                className={overallReadiness >= 100 ? "text-green-500" : overallReadiness >= 50 ? "text-blue-500" : "text-yellow-500"}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{overallReadiness}%</span>
            </div>
          </div>

          <div className="flex-1">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
              {overallReadiness >= 100
                ? "Your idea is fully validated and ready to be promoted to a project!"
                : `Complete ${incompleteItems.length} more ${incompleteItems.length === 1 ? 'area' : 'areas'} to reach full readiness.`}
            </p>
            {overallReadiness >= 100 && (
              <p className="text-sm font-medium text-green-600 dark:text-green-400">
                Click "Promote to Project" to move forward!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Individual progress items */}
      <div className="p-4 space-y-3">
        {items.map(item => {
          const Icon = item.icon;
          const isComplete = item.current >= item.target;
          const progress = Math.min((item.current / item.target) * 100, 100);

          return (
            <div
              key={item.id}
              className={`flex items-center gap-4 p-3 rounded-lg transition ${
                !isComplete && onNavigate ? "hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer" : ""
              }`}
              onClick={() => !isComplete && onNavigate?.(item.tab)}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.bgColor}`}>
                <Icon className={`w-5 h-5 ${item.color}`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-900 dark:text-white">{item.label}</span>
                  <span className={`text-sm ${isComplete ? "text-green-600" : "text-slate-600 dark:text-slate-400"}`}>
                    {item.current}/{item.target}
                  </span>
                </div>
                <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isComplete ? "bg-green-500" : "bg-slate-400"
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {!isComplete && onNavigate && (
                <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      {/* Action suggestions */}
      {incompleteItems.length > 0 && (
        <div className="px-4 pb-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">Next Steps</p>
            <ul className="space-y-1">
              {incompleteItems.slice(0, 3).map(item => (
                <li key={item.id} className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                  {item.action}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
