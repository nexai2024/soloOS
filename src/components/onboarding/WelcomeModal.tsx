"use client";

import { useState } from "react";
import { X, Lightbulb, Rocket, TrendingUp, ArrowRight, CheckCircle2 } from "lucide-react";

interface WelcomeModalProps {
  userName: string;
  onComplete: () => void;
}

const steps = [
  {
    icon: Lightbulb,
    title: "Capture Ideas",
    description: "Start by capturing your business ideas. Add personas, define problems, and analyze competitors.",
    color: "text-yellow-500",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30"
  },
  {
    icon: CheckCircle2,
    title: "Validate & Score",
    description: "Use AI-powered scoring to evaluate market size, complexity, and monetization potential.",
    color: "text-blue-500",
    bgColor: "bg-blue-100 dark:bg-blue-900/30"
  },
  {
    icon: Rocket,
    title: "Promote to Projects",
    description: "Once validated, promote your best ideas to full projects with roadmaps and milestones.",
    color: "text-green-500",
    bgColor: "bg-green-100 dark:bg-green-900/30"
  },
  {
    icon: TrendingUp,
    title: "Launch & Grow",
    description: "Track your product launch, manage marketing campaigns, and monitor user growth.",
    color: "text-purple-500",
    bgColor: "bg-purple-100 dark:bg-purple-900/30"
  }
];

export function WelcomeModal({ userName, onComplete }: WelcomeModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold mb-1">
            {currentStep === 0 ? `Welcome, ${userName}!` : step.title}
          </h2>
          <p className="text-blue-100">
            {currentStep === 0
              ? "Let's get you started with SoloOS"
              : `Step ${currentStep + 1} of ${steps.length}`}
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex flex-col items-center text-center mb-6">
            <div className={`w-16 h-16 ${step.bgColor} rounded-2xl flex items-center justify-center mb-4`}>
              <Icon className={`w-8 h-8 ${step.color}`} />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              {step.title}
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              {step.description}
            </p>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-6">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentStep
                    ? "w-6 bg-blue-600"
                    : index < currentStep
                    ? "bg-blue-400"
                    : "bg-slate-300 dark:bg-slate-600"
                }`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSkip}
              className="flex-1 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium transition"
            >
              Skip Tour
            </button>
            <button
              onClick={handleNext}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
            >
              {currentStep < steps.length - 1 ? (
                <>
                  Next
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                "Get Started"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
