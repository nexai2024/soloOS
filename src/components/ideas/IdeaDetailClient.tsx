"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Lightbulb,
  Users,
  AlertCircle,
  CheckSquare,
  TrendingUp,
  Trash2,
  Edit3,
  Rocket,
  Sparkles,
  Target,
  ArrowLeft,
  Wand2,
  Loader2,
  X
} from "lucide-react";
import { Idea, Persona, ProblemStatement, ValidationChecklist, CompetitorAnalysis, ScoreImprovement } from "@/generated/prisma/client";
import { fetchPost, fetchDelete } from "@/lib/fetch";
import { useToast } from "@/contexts/ToastContext";
import { AIScoreBreakdown } from "./AIScoreBreakdown";
import { PersonaCard } from "./PersonaCard";
import { ProblemCard } from "./ProblemCard";
import { ValidationProgress } from "./ValidationProgress";
import { CompetitorCard } from "./CompetitorCard";
import { PersonaForm } from "./PersonaForm";
import { ProblemStatementForm } from "./ProblemStatementForm";
import { ValidationChecklistForm } from "./ValidationChecklistForm";
import { CompetitorForm } from "./CompetitorForm";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { PromoteButton } from "./PromoteButton";
import { PersonasTab } from "./PersonasTab";
import { ProblemsTab } from "./ProblemsTab";
import { ValidationTab } from "./ValidationTab";
import { CompetitorsTab } from "./CompetitorsTab";
import { IdeaReadinessScore } from "./IdeaReadinessScore";

type IdeaWithRelations = Idea & {
  personas: Persona[];
  problemStatements: ProblemStatement[];
  validationItems: ValidationChecklist[];
  competitors: CompetitorAnalysis[];
  scoreImprovements: ScoreImprovement[];
};

type Tab = "overview" | "personas" | "problems" | "validation" | "competitors";

export function IdeaDetailClient({ idea: initialIdea }: { idea: IdeaWithRelations }) {
  const router = useRouter();
  const toast = useToast();
  const [idea, setIdea] = useState(initialIdea);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [isScoring, setIsScoring] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAIGenerateModal, setShowAIGenerateModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedGenerateTypes, setSelectedGenerateTypes] = useState<string[]>([]);

  // Calculate validation progress
  const validationProgress = idea.validationItems.length > 0
    ? (idea.validationItems.filter(v => v.isCompleted).length / idea.validationItems.length) * 100
    : 0;

  const isValidationComplete = validationProgress === 100 && idea.validationItems.length > 0;

  // Trigger AI Scoring
  const handleScore = async () => {
    setIsScoring(true);
    setError(null);
    const result = await fetchPost<IdeaWithRelations>(`/api/ideas/${idea.id}/score`);
    if (result.ok) {
      setIdea(result.data);
      toast.success("AI scoring complete");
    } else {
      setError(result.error);
      toast.error(result.error);
    }
    setIsScoring(false);
  };

  // Delete Idea
  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    const result = await fetchDelete(`/api/ideas/${idea.id}`);
    if (result.ok) {
      toast.success("Idea deleted");
      router.push("/ideas");
      router.refresh();
    } else {
      setError(result.error);
      toast.error(result.error);
      setShowDeleteModal(false);
    }
    setIsDeleting(false);
  };

  // Promote to Project
  const handlePromote = async () => {
    setError(null);
    const result = await fetchPost<{ idea: IdeaWithRelations }>(`/api/ideas/${idea.id}/promote`);
    if (result.ok) {
      setIdea(result.data.idea);
      toast.success("Idea promoted to project!");
      router.push(`/ideas/${result.data.idea.id}`);
      router.refresh();
    } else {
      setError(result.error);
      toast.error(result.error);
    }
  };

  // AI Generate artifacts
  const handleAIGenerate = async () => {
    if (selectedGenerateTypes.length === 0) return;

    setIsGenerating(true);
    setError(null);
    const result = await fetchPost<{ idea: IdeaWithRelations }>(`/api/ideas/${idea.id}/generate`, { types: selectedGenerateTypes });
    if (result.ok) {
      setIdea(result.data.idea);
      setShowAIGenerateModal(false);
      setSelectedGenerateTypes([]);
      toast.success("AI generation complete");
    } else {
      setError(result.error);
      toast.error(result.error);
    }
    setIsGenerating(false);
  };

  const toggleGenerateType = (type: string) => {
    setSelectedGenerateTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: Lightbulb },
    { id: "personas", label: "Personas", icon: Users, count: idea.personas.length },
    { id: "problems", label: "Problems", icon: AlertCircle, count: idea.problemStatements.length },
    { id: "validation", label: "Validation", icon: CheckSquare, count: idea.validationItems.length },
    { id: "competitors", label: "Competitors", icon: Target, count: idea.competitors.length }
  ];

  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Back Navigation */}
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-700 text-sm flex-1">{error}</p>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800 font-medium text-sm">
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                idea.status === 'PROMOTED' ? 'bg-green-100 text-green-700' :
                idea.status === 'VALIDATING' ? 'bg-blue-100 text-blue-700' :
                idea.status === 'RESEARCHING' ? 'bg-purple-100 text-purple-700' :
                idea.status === 'ARCHIVED' ? 'bg-slate-100 text-slate-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {idea.status}
              </span>
              {isValidationComplete && idea.status !== 'PROMOTED' && (
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">
                  <CheckSquare className="w-3 h-3" />
                  Ready to Promote
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{idea.title}</h1>
            <p className="text-slate-600">{idea.description}</p>
          </div>
          
          <div className="flex gap-2 ml-4">
            <button
              onClick={() => setShowAIGenerateModal(true)}
              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
              title="Generate with AI"
            >
              <Wand2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
              title="Edit"
            >
              <Edit3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
              title="Delete"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* AI Generate Banner */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Wand2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                  AI-Powered Ideation
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Generate personas, problems, validation tasks, and competitor analysis with AI
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAIGenerateModal(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Generate
            </button>
          </div>
        </div>

        {/* AI Score Section */}
        {idea.aiScore ? (
          <AIScoreBreakdown
            aiScore={idea.aiScore!}
            marketSizeScore={idea.marketSizeScore}
            marketGrowthScore={idea.marketGrowthScore}
            problemSeverityScore={idea.problemSeverityScore}
            competitiveAdvantageScore={idea.competitiveAdvantageScore}
            executionFeasibilityScore={idea.executionFeasibilityScore}
            monetizationScore={idea.monetizationScore}
            timingScore={idea.timingScore}
            marketSizeReason={idea.marketSizeReason}
            marketGrowthReason={idea.marketGrowthReason}
            problemSeverityReason={idea.problemSeverityReason}
            competitiveAdvantageReason={idea.competitiveAdvantageReason}
            executionFeasibilityReason={idea.executionFeasibilityReason}
            monetizationReason={idea.monetizationReason}
            timingReason={idea.timingReason}
            aiScoreReason={idea.aiScoreReason}
            overallAssessment={idea.overallAssessment}
            improvements={idea.scoreImprovements}
            ideaId={idea.id}
            onImprovementsChange={(improvements) => setIdea({ ...idea, scoreImprovements: improvements })}
            onRescore={handleScore}
            isScoring={isScoring}
          />
        ) : (
          <button
            onClick={handleScore}
            disabled={isScoring}
            className="w-full mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 font-medium transition"
          >
            {isScoring ? (
              <>
                <Sparkles className="w-5 h-5 animate-spin" />
                Analyzing with AI...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Score This Idea with AI
              </>
            )}
          </button>
        )}

        {/* Validation Progress */}
        {idea.validationItems.length > 0 && (
          <div className="mt-6">
            <ValidationProgress
              completed={idea.validationItems.filter(v => v.isCompleted).length}
              total={idea.validationItems.length}
              percentage={validationProgress}
            />
          </div>
        )}

        {/* Promote Button */}
        {idea.status !== 'PROMOTED' && (
          <PromoteButton
            onClick={handlePromote}
            disabled={!isValidationComplete}
            className="mt-4"
          />
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition whitespace-nowrap ${
                    activeTab === tab.id
                      ? "text-indigo-600 border-b-2 border-indigo-600"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      activeTab === tab.id
                        ? "bg-indigo-100 text-indigo-700"
                        : "bg-slate-100 text-slate-600"
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {activeTab === "overview" && (
            <OverviewTab
              idea={idea}
              onRefresh={() => router.refresh()}
              onNavigate={(tab: string) => setActiveTab(tab as Tab)}
            />
          )}
          
          {activeTab === "personas" && (
            <PersonasTab
              ideaId={idea.id}
              personas={idea.personas}
              onUpdate={(personas: Persona[]) => setIdea({ ...idea, personas })}
            />
          )}

          {activeTab === "problems" && (
            <ProblemsTab
              ideaId={idea.id}
              problems={idea.problemStatements}
              onUpdate={(problemStatements: ProblemStatement[]) => setIdea({ ...idea, problemStatements })}
            />
          )}

          {activeTab === "validation" && (
            <ValidationTab
              ideaId={idea.id}
              items={idea.validationItems}
              onUpdate={(validationItems: ValidationChecklist[]) => setIdea({ ...idea, validationItems })}
            />
          )}

          {activeTab === "competitors" && (
            <CompetitorsTab
              ideaId={idea.id}
              competitors={idea.competitors}
              onUpdate={(competitors: CompetitorAnalysis[]) => setIdea({ ...idea, competitors })}
            />
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteConfirmModal
          title={`Delete "${idea.title}"?`}
          message="This action cannot be undone. All associated personas, problems, validation items, and competitor analyses will be permanently deleted."
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}

      {/* AI Generate Modal */}
      {showAIGenerateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Wand2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Generate with AI
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Select what to generate for this idea
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAIGenerateModal(false);
                  setSelectedGenerateTypes([]);
                }}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-3 mb-6">
              {[
                {
                  id: "personas",
                  label: "Personas",
                  description: "Generate target user personas with pain points and goals",
                  icon: Users,
                  existing: idea.personas.length,
                },
                {
                  id: "problems",
                  label: "Problem Statements",
                  description: "Generate specific problems this idea solves",
                  icon: AlertCircle,
                  existing: idea.problemStatements.length,
                },
                {
                  id: "validation",
                  label: "Validation Checklist",
                  description: "Generate tasks to validate the idea before building",
                  icon: CheckSquare,
                  existing: idea.validationItems.length,
                },
                {
                  id: "competitors",
                  label: "Competitor Analysis",
                  description: "Generate analysis of potential competitors",
                  icon: Target,
                  existing: idea.competitors.length,
                },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = selectedGenerateTypes.includes(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleGenerateType(item.id)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          isSelected
                            ? "bg-purple-100 dark:bg-purple-900/30"
                            : "bg-slate-100 dark:bg-slate-700"
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 ${
                            isSelected
                              ? "text-purple-600 dark:text-purple-400"
                              : "text-slate-600 dark:text-slate-400"
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3
                            className={`font-semibold ${
                              isSelected
                                ? "text-purple-900 dark:text-purple-100"
                                : "text-slate-900 dark:text-white"
                            }`}
                          >
                            {item.label}
                          </h3>
                          {item.existing > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                              {item.existing} existing
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          {item.description}
                        </p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected
                            ? "border-purple-500 bg-purple-500"
                            : "border-slate-300 dark:border-slate-600"
                        }`}
                      >
                        {isSelected && (
                          <CheckSquare className="w-3 h-3 text-white" />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedGenerateTypes.length > 0 && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                AI will generate new items and add them to your existing {selectedGenerateTypes.join(", ")}.
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAIGenerateModal(false);
                  setSelectedGenerateTypes([]);
                }}
                className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAIGenerate}
                disabled={selectedGenerateTypes.length === 0 || isGenerating}
                className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition font-medium flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate {selectedGenerateTypes.length > 0 ? `(${selectedGenerateTypes.length})` : ""}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Overview Tab Component
function OverviewTab({
  idea,
  onRefresh,
  onNavigate
}: {
  idea: IdeaWithRelations;
  onRefresh: () => void;
  onNavigate: (tab: string) => void;
}) {
  const completedValidation = idea.validationItems.filter(v => v.isCompleted).length;

  return (
    <div className="space-y-6">
      {/* Readiness Score */}
      <IdeaReadinessScore
        personasCount={idea.personas.length}
        problemsCount={idea.problemStatements.length}
        validationCompleted={completedValidation}
        validationTotal={idea.validationItems.length}
        competitorsCount={idea.competitors.length}
        hasAiScore={!!idea.aiScore}
        onNavigate={onNavigate}
      />

      {/* Quick Stats */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Quick Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Personas" value={idea.personas.length} icon={Users} />
          <StatCard label="Problems" value={idea.problemStatements.length} icon={AlertCircle} />
          <StatCard label="Validation Items" value={idea.validationItems.length} icon={CheckSquare} />
          <StatCard label="Competitors" value={idea.competitors.length} icon={Target} />
        </div>
      </div>

      {/* Timeline */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Timeline</h3>
        <div className="space-y-2 text-sm text-slate-600">
          <p>Created: {new Date(idea.createdAt).toLocaleDateString()}</p>
          <p>Last Updated: {new Date(idea.updatedAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: any }) {
  return (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-slate-600" />
        <span className="text-xs font-medium text-slate-600">{label}</span>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}