"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lightbulb, Sparkles, Loader2, ArrowLeft } from "lucide-react";

interface IdeaFormProps {
    initialData?: {
        title: string;
        description: string;
    };
    ideaId?: string;
}

export function IdeaForm({ initialData, ideaId }: IdeaFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [title, setTitle] = useState(initialData?.title || "");
    const [description, setDescription] = useState(initialData?.description || "");
    const [errors, setErrors] = useState<{ title?: string; description?: string }>({});
    const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
    const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(false);

    // Validation
    const validate = () => {
        const newErrors: typeof errors = {};
        if (!title.trim()) newErrors.title = "Title is required";
        if (title.length < 5) newErrors.title = "Title must be at least 5 characters";
        if (!description.trim()) newErrors.description = "Description is required";
        if (description.length < 20) newErrors.description = "Description must be at least 20 characters";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    useEffect(() => {
        const draftKey = `idea-draft-${ideaId || "new"}`;

        // Load draft on mount
        const savedDraft = localStorage.getItem(draftKey);
        if (savedDraft && !ideaId) {
            const { title: savedTitle, description: savedDescription } = JSON.parse(savedDraft);
            if (savedTitle) setTitle(savedTitle);
            if (savedDescription) setDescription(savedDescription);
        }

        // Auto-save every 2 seconds
        const timer = setTimeout(() => {
            if (title || description) {
                localStorage.setItem(draftKey, JSON.stringify({ title, description }));
            }
        }, 2000);

        return () => clearTimeout(timer);
    }, [title, description, ideaId]);
    // Submit Handler
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        startTransition(async () => {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("description", description);

            const response = await fetch(ideaId ? `/api/ideas/${ideaId}` : "/api/ideas", {
                method: ideaId ? "PATCH" : "POST",
                body: JSON.stringify({ title, description }),
                headers: { "Content-Type": "application/json" }
            });

            if (response.ok) {
                localStorage.removeItem(`idea-draft-${ideaId || "new"}`); // Clear draft
                const data = await response.json();
                router.push(`/ideas/${data.id}`);
                router.refresh();
            }
        });
    };

    // AI Enhancement Suggestion
    const generateAISuggestion = async () => {
        if (!title.trim()) return;

        setIsGeneratingSuggestion(true);
        try {
            const response = await fetch("/api/ideas/enhance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, description })
            });
            const data = await response.json();
            setAiSuggestion(data.suggestion);
        } catch (error) {
            console.error("Failed to generate suggestion:", error);
        } finally {
            setIsGeneratingSuggestion(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-8">
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

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-indigo-100 rounded-xl">
                        <Lightbulb className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            {ideaId ? "Edit Idea" : "Capture Your Idea"}
                        </h1>
                        <p className="text-sm text-slate-500">
                            Start with a title and description. We'll help you validate it.
                        </p>
                    </div>
                </div>
                {!ideaId && (title || description) && (
                    <div className="mb-4 text-xs text-slate-500 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        Draft auto-saved
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title Input */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-semibold text-slate-700 mb-2">
                            Idea Title
                        </label>
                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., AI-powered meal planner for busy parents"
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${errors.title ? "border-red-500" : "border-slate-300"
                                }`}
                        />
                        {errors.title && (
                            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                        )}
                        <p className="mt-1 text-xs text-slate-500">
                            {title.length}/100 characters
                        </p>
                    </div>

                    {/* Description Textarea */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-2">
                            Description
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe the problem you're solving, who it's for, and how it works..."
                            rows={6}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none ${errors.description ? "border-red-500" : "border-slate-300"
                                }`}
                        />
                        {errors.description && (
                            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                        )}
                        <p className="mt-1 text-xs text-slate-500">
                            {description.length} characters
                        </p>
                    </div>

                    {/* AI Enhancement Button */}
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold text-slate-900 mb-1 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-purple-600" />
                                    AI Enhancement
                                </h3>
                                <p className="text-xs text-slate-600 mb-3">
                                    Get AI-powered suggestions to strengthen your idea description
                                </p>
                                {aiSuggestion && (
                                    <div className="bg-white rounded-lg p-3 text-sm text-slate-700 border border-purple-200">
                                        {aiSuggestion}
                                    </div>
                                )}
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={generateAISuggestion}
                            disabled={isGeneratingSuggestion || !title.trim()}
                            className="mt-3 w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-medium transition"
                        >
                            {isGeneratingSuggestion ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4" />
                                    Enhance with AI
                                </>
                            )}
                        </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition flex items-center justify-center gap-2"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                ideaId ? "Update Idea" : "Create Idea"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}