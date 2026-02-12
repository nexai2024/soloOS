"use client";

import { useState } from "react";
import {
  TrendingUp,
  Target,
  Flame,
  Shield,
  Wrench,
  DollarSign,
  Clock,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Info,
} from "lucide-react";

/**
 * SCORING CATEGORIES & WEIGHTS
 *
 * 1. Market Size (15%) - TAM/SAM/SOM analysis
 * 2. Market Growth (10%) - Market trajectory
 * 3. Problem Severity (20%) - "Hair on fire" test - HIGHEST WEIGHT
 * 4. Competitive Advantage (15%) - Moat potential
 * 5. Execution Feasibility (15%) - Build complexity
 * 6. Monetization (15%) - Revenue clarity
 * 7. Timing (10%) - Market timing
 */

interface ScoreCategory {
  id: string;
  label: string;
  score: number;
  reason: string;
  weight: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
}

interface AIScoreBreakdownProps {
  // Individual scores
  marketSizeScore?: number | null;
  marketGrowthScore?: number | null;
  problemSeverityScore?: number | null;
  competitiveAdvantageScore?: number | null;
  executionFeasibilityScore?: number | null;
  monetizationScore?: number | null;
  timingScore?: number | null;

  // Composite score
  aiScore: number;

  // Reasoning (optional - shown on expand)
  marketSizeReason?: string | null;
  marketGrowthReason?: string | null;
  problemSeverityReason?: string | null;
  competitiveAdvantageReason?: string | null;
  executionFeasibilityReason?: string | null;
  monetizationReason?: string | null;
  timingReason?: string | null;
  aiScoreReason?: string | null;

  // Analysis (optional)
  overallAssessment?: string | null;
  strengths?: string[];
  weaknesses?: string[];
  recommendations?: string[];
  keyRisks?: string[];
  marketEvaluation?: string | null;

  // Legacy props for backward compatibility
  marketSize?: number;
  complexity?: number;
  monetization?: number;
  composite?: number;
}

export function AIScoreBreakdown(props: AIScoreBreakdownProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showFullAnalysis, setShowFullAnalysis] = useState(false);

  // Handle both new and legacy props
  const aiScore = props.aiScore ?? props.composite ?? 0;

  // Build categories array
  const categories: ScoreCategory[] = [
    {
      id: "problemSeverity",
      label: "Problem Severity",
      score: props.problemSeverityScore ?? 50,
      reason: props.problemSeverityReason || "Not analyzed yet",
      weight: 20,
      icon: Flame,
      color: "red",
      description: '"Hair on fire" test - How painful is this problem?',
    },
    {
      id: "marketSize",
      label: "Market Size",
      score: props.marketSizeScore ?? props.marketSize ?? 50,
      reason: props.marketSizeReason || "Not analyzed yet",
      weight: 15,
      icon: TrendingUp,
      color: "blue",
      description: "TAM/SAM/SOM - How big is the opportunity?",
    },
    {
      id: "competitiveAdvantage",
      label: "Competitive Advantage",
      score: props.competitiveAdvantageScore ?? 50,
      reason: props.competitiveAdvantageReason || "Not analyzed yet",
      weight: 15,
      icon: Shield,
      color: "purple",
      description: "Moat potential - Can you defend this position?",
    },
    {
      id: "executionFeasibility",
      label: "Execution Feasibility",
      score: props.executionFeasibilityScore ?? (props.complexity ? 100 - props.complexity : 50),
      reason: props.executionFeasibilityReason || "Not analyzed yet",
      weight: 15,
      icon: Wrench,
      color: "orange",
      description: "Build complexity - Can you actually build this?",
    },
    {
      id: "monetization",
      label: "Monetization Clarity",
      score: props.monetizationScore ?? props.monetization ?? 50,
      reason: props.monetizationReason || "Not analyzed yet",
      weight: 15,
      icon: DollarSign,
      color: "green",
      description: "Revenue clarity - How will you make money?",
    },
    {
      id: "marketGrowth",
      label: "Market Growth",
      score: props.marketGrowthScore ?? 50,
      reason: props.marketGrowthReason || "Not analyzed yet",
      weight: 10,
      icon: Target,
      color: "cyan",
      description: "Market trajectory - Is this market expanding?",
    },
    {
      id: "timing",
      label: "Timing & Trends",
      score: props.timingScore ?? 50,
      reason: props.timingReason || "Not analyzed yet",
      weight: 10,
      icon: Clock,
      color: "amber",
      description: "Market timing - Is NOW the right time?",
    },
  ];

  // Sort by weight (highest first)
  categories.sort((a, b) => b.weight - a.weight);

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-blue-600 dark:text-blue-400";
    if (score >= 45) return "text-yellow-600 dark:text-yellow-400";
    if (score >= 30) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 75) return "bg-green-500";
    if (score >= 60) return "bg-blue-500";
    if (score >= 45) return "bg-yellow-500";
    if (score >= 30) return "bg-orange-500";
    return "bg-red-500";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Exceptional";
    if (score >= 65) return "Strong";
    if (score >= 50) return "Moderate";
    if (score >= 35) return "Weak";
    return "Poor";
  };

  const getOverallGrade = (score: number) => {
    if (score >= 80) return { grade: "A", label: "Exceptional Opportunity", color: "green" };
    if (score >= 65) return { grade: "B", label: "Strong Opportunity", color: "blue" };
    if (score >= 50) return { grade: "C", label: "Moderate Opportunity", color: "yellow" };
    if (score >= 35) return { grade: "D", label: "Needs Work", color: "orange" };
    return { grade: "F", label: "Reconsider", color: "red" };
  };

  const overallGrade = getOverallGrade(aiScore);

  const colorClasses: Record<string, { bg: string; text: string; light: string }> = {
    red: { bg: "bg-red-500", text: "text-red-600 dark:text-red-400", light: "bg-red-100 dark:bg-red-900/30" },
    blue: { bg: "bg-blue-500", text: "text-blue-600 dark:text-blue-400", light: "bg-blue-100 dark:bg-blue-900/30" },
    purple: { bg: "bg-purple-500", text: "text-purple-600 dark:text-purple-400", light: "bg-purple-100 dark:bg-purple-900/30" },
    orange: { bg: "bg-orange-500", text: "text-orange-600 dark:text-orange-400", light: "bg-orange-100 dark:bg-orange-900/30" },
    green: { bg: "bg-green-500", text: "text-green-600 dark:text-green-400", light: "bg-green-100 dark:bg-green-900/30" },
    cyan: { bg: "bg-cyan-500", text: "text-cyan-600 dark:text-cyan-400", light: "bg-cyan-100 dark:bg-cyan-900/30" },
    amber: { bg: "bg-amber-500", text: "text-amber-600 dark:text-amber-400", light: "bg-amber-100 dark:bg-amber-900/30" },
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Header with Overall Score */}
      <div className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">AI Score Analysis</h3>
            <p className="text-indigo-100 text-sm">
              Comprehensive evaluation across 7 key dimensions
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-white">{Math.round(aiScore)}</span>
              <span className="text-xl text-indigo-200">/100</span>
            </div>
            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium mt-2 ${
              overallGrade.color === "green" ? "bg-green-400/20 text-green-100" :
              overallGrade.color === "blue" ? "bg-blue-400/20 text-blue-100" :
              overallGrade.color === "yellow" ? "bg-yellow-400/20 text-yellow-100" :
              overallGrade.color === "orange" ? "bg-orange-400/20 text-orange-100" :
              "bg-red-400/20 text-red-100"
            }`}>
              <span className="font-bold">{overallGrade.grade}</span>
              <span>• {overallGrade.label}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Score Interpretation */}
      {props.aiScoreReason && (
        <div className="px-6 py-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <p className="text-slate-700 dark:text-slate-300 text-sm">
            {props.aiScoreReason}
          </p>
        </div>
      )}

      {/* Category Scores */}
      <div className="p-6 space-y-3">
        {categories.map((category) => {
          const Icon = category.icon;
          const isExpanded = expandedCategory === category.id;
          const colors = colorClasses[category.color];

          return (
            <div
              key={category.id}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
            >
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition"
              >
                <div className={`p-2 rounded-lg ${colors.light}`}>
                  <Icon className={`w-5 h-5 ${colors.text}`} />
                </div>

                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {category.label}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                      {category.weight}% weight
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {category.description}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className={`text-2xl font-bold ${getScoreColor(category.score)}`}>
                      {category.score}
                    </span>
                    <p className={`text-xs ${getScoreColor(category.score)}`}>
                      {getScoreLabel(category.score)}
                    </p>
                  </div>

                  <div className="w-24">
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getScoreBgColor(category.score)} transition-all duration-500`}
                        style={{ width: `${category.score}%` }}
                      />
                    </div>
                  </div>

                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 pt-0">
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {category.reason}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Detailed Analysis Section */}
      {(props.strengths?.length || props.weaknesses?.length || props.recommendations?.length || props.keyRisks?.length || props.overallAssessment) && (
        <div className="border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setShowFullAnalysis(!showFullAnalysis)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
          >
            <span className="font-semibold text-slate-900 dark:text-white">
              Full Analysis & Recommendations
            </span>
            {showFullAnalysis ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </button>

          {showFullAnalysis && (
            <div className="px-6 pb-6 space-y-6">
              {/* Overall Assessment */}
              {props.overallAssessment && (
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-2">
                        Executive Summary
                      </h4>
                      <p className="text-sm text-indigo-800 dark:text-indigo-200">
                        {props.overallAssessment}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Strengths */}
                {props.strengths && props.strengths.length > 0 && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <h4 className="font-semibold text-green-900 dark:text-green-100">
                        Strengths
                      </h4>
                    </div>
                    <ul className="space-y-2">
                      {props.strengths.map((strength, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-green-800 dark:text-green-200">
                          <span className="text-green-500 mt-1">•</span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Weaknesses */}
                {props.weaknesses && props.weaknesses.length > 0 && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      <h4 className="font-semibold text-red-900 dark:text-red-100">
                        Weaknesses
                      </h4>
                    </div>
                    <ul className="space-y-2">
                      {props.weaknesses.map((weakness, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-red-800 dark:text-red-200">
                          <span className="text-red-500 mt-1">•</span>
                          {weakness}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Recommendations */}
              {props.recommendations && props.recommendations.length > 0 && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                      Recommendations
                    </h4>
                  </div>
                  <ul className="space-y-2">
                    {props.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-blue-800 dark:text-blue-200">
                        <span className="font-bold text-blue-500">{i + 1}.</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Key Risks */}
              {props.keyRisks && props.keyRisks.length > 0 && (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    <h4 className="font-semibold text-amber-900 dark:text-amber-100">
                      Key Risks to Monitor
                    </h4>
                  </div>
                  <ul className="space-y-2">
                    {props.keyRisks.map((risk, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-amber-800 dark:text-amber-200">
                        <span className="text-amber-500 mt-1">⚠</span>
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Market Evaluation */}
              {props.marketEvaluation && (
                <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                    Market Analysis
                  </h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {props.marketEvaluation}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Methodology Note */}
      <div className="px-6 py-3 bg-slate-100 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
          Scoring methodology based on Y Combinator, Hamilton Helmer's 7 Powers, and leading VC frameworks.
          Problem Severity weighted highest (20%) as the strongest predictor of startup success.
        </p>
      </div>
    </div>
  );
}
