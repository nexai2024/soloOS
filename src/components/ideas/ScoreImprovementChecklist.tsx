"use client";

import { useState } from "react";
import {
  Check,
  X,
  Undo2,
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp,
  Zap,
} from "lucide-react";
import { ScoreImprovement } from "@/generated/prisma/client";
import { fetchPatch } from "@/lib/fetch";
import { useToast } from "@/contexts/ToastContext";

const DIMENSION_COLORS: Record<string, { bg: string; text: string }> = {
  marketSize: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-300" },
  marketGrowth: { bg: "bg-cyan-100 dark:bg-cyan-900/30", text: "text-cyan-700 dark:text-cyan-300" },
  problemSeverity: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-300" },
  competitiveAdvantage: { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-700 dark:text-purple-300" },
  executionFeasibility: { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-300" },
  monetization: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-300" },
  timing: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-300" },
};

const DIMENSION_LABELS: Record<string, string> = {
  marketSize: "Market Size",
  marketGrowth: "Market Growth",
  problemSeverity: "Problem Severity",
  competitiveAdvantage: "Competitive Advantage",
  executionFeasibility: "Execution Feasibility",
  monetization: "Monetization",
  timing: "Timing",
};

const CATEGORY_COLORS: Record<string, string> = {
  features: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  niche: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  positioning: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  techStack: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
  pricing: "bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-300",
  marketing: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
  partnerships: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
  timing: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
};

interface ScoreImprovementChecklistProps {
  improvements: ScoreImprovement[];
  ideaId: string;
  onImprovementsChange: (improvements: ScoreImprovement[]) => void;
  onRescore: () => void;
  isScoring: boolean;
}

export function ScoreImprovementChecklist({
  improvements,
  ideaId,
  onImprovementsChange,
  onRescore,
  isScoring,
}: ScoreImprovementChecklistProps) {
  const toast = useToast();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [showDismissed, setShowDismissed] = useState(false);

  const pendingItems = improvements.filter((i) => i.status === "PENDING");
  const completedItems = improvements.filter((i) => i.status === "COMPLETED");
  const dismissedItems = improvements.filter((i) => i.status === "DISMISSED");

  const completedCount = completedItems.length;
  const totalActive = pendingItems.length + completedItems.length;
  const hasCompleted = completedCount > 0;

  const updateStatus = async (improvementId: string, status: string) => {
    setUpdatingId(improvementId);
    const result = await fetchPatch<ScoreImprovement>(
      `/api/ideas/${ideaId}/improvements/${improvementId}`,
      { status }
    );
    if (result.ok) {
      onImprovementsChange(
        improvements.map((i) => (i.id === improvementId ? result.data : i))
      );
    } else {
      toast.error(result.error);
    }
    setUpdatingId(null);
  };

  if (improvements.length === 0) return null;

  return (
    <div className="border-t border-slate-200 dark:border-slate-700">
      <div className="px-6 py-4">
        {/* Progress Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white">
                Score Improvement Suggestions
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {completedCount} of {totalActive} improvements completed
              </p>
            </div>
          </div>
          {totalActive > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 transition-all duration-300"
                  style={{ width: `${totalActive > 0 ? (completedCount / totalActive) * 100 : 0}%` }}
                />
              </div>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {totalActive > 0 ? Math.round((completedCount / totalActive) * 100) : 0}%
              </span>
            </div>
          )}
        </div>

        {/* Pending Items */}
        <div className="space-y-2">
          {pendingItems.map((item) => (
            <ImprovementItem
              key={item.id}
              item={item}
              isUpdating={updatingId === item.id}
              onComplete={() => updateStatus(item.id, "COMPLETED")}
              onDismiss={() => updateStatus(item.id, "DISMISSED")}
            />
          ))}
        </div>

        {/* Completed Items */}
        {completedItems.length > 0 && (
          <div className="mt-3 space-y-2">
            {completedItems.map((item) => (
              <ImprovementItem
                key={item.id}
                item={item}
                isUpdating={updatingId === item.id}
                onUndo={() => updateStatus(item.id, "PENDING")}
                completed
              />
            ))}
          </div>
        )}

        {/* Dismissed Items Toggle */}
        {dismissedItems.length > 0 && (
          <div className="mt-3">
            <button
              onClick={() => setShowDismissed(!showDismissed)}
              className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition"
            >
              {showDismissed ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {showDismissed ? "Hide" : "Show"} {dismissedItems.length} dismissed
            </button>
            {showDismissed && (
              <div className="mt-2 space-y-2">
                {dismissedItems.map((item) => (
                  <ImprovementItem
                    key={item.id}
                    item={item}
                    isUpdating={updatingId === item.id}
                    onUndo={() => updateStatus(item.id, "PENDING")}
                    dismissed
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Re-score CTA */}
        {hasCompleted && (
          <button
            onClick={onRescore}
            disabled={isScoring}
            className="w-full mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-3 rounded-xl hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 font-medium transition"
          >
            {isScoring ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Re-scoring...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Re-score After Improvements
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function ImprovementItem({
  item,
  isUpdating,
  onComplete,
  onDismiss,
  onUndo,
  completed,
  dismissed,
}: {
  item: ScoreImprovement;
  isUpdating: boolean;
  onComplete?: () => void;
  onDismiss?: () => void;
  onUndo?: () => void;
  completed?: boolean;
  dismissed?: boolean;
}) {
  const categoryClass = CATEGORY_COLORS[item.category] || "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300";

  return (
    <div
      className={`p-3 rounded-lg border transition ${
        completed
          ? "bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800/50"
          : dismissed
            ? "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-60"
            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className={`text-sm ${completed ? "line-through text-slate-500 dark:text-slate-400" : "text-slate-800 dark:text-slate-200"}`}>
            {item.suggestion}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryClass}`}>
              {item.category}
            </span>
            {item.targetDimensions.map((dim) => {
              const colors = DIMENSION_COLORS[dim] || { bg: "bg-slate-100 dark:bg-slate-700", text: "text-slate-600 dark:text-slate-400" };
              return (
                <span key={dim} className={`text-xs px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
                  {DIMENSION_LABELS[dim] || dim}
                </span>
              );
            })}
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium">
              +{item.estimatedImpact} pts
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {isUpdating ? (
            <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
          ) : (completed || dismissed) ? (
            <button
              onClick={onUndo}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
              title="Undo"
            >
              <Undo2 className="w-4 h-4" />
            </button>
          ) : (
            <>
              <button
                onClick={onComplete}
                className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition"
                title="Mark as completed"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={onDismiss}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
