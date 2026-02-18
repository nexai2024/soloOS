'use client';

import { useState } from 'react';
import {
  Sparkles,
  Loader2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  History,
  X,
} from 'lucide-react';
import { fetchPost } from '@/lib/fetch';
import { useToast } from '@/contexts/ToastContext';
import type { AIContentType, BrandVoiceData } from '@/lib/marketing/types';
import BrandVoiceSelector from './BrandVoiceSelector';

interface AIContentPanelProps {
  contentType: AIContentType;
  apiEndpoint: string;
  buildPayload: (prompt: string, brandVoice?: BrandVoiceData | null) => Record<string, unknown>;
  onUseContent: (content: string) => void;
  placeholder?: string;
}

export default function AIContentPanel({
  contentType,
  apiEndpoint,
  buildPayload,
  onUseContent,
  placeholder = 'Describe what you want to generate...',
}: AIContentPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<BrandVoiceData | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const toast = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setResult(null);

    const payload = buildPayload(prompt, selectedVoice);
    const res = await fetchPost<{ result: string }>(apiEndpoint, payload);

    if (res.ok) {
      const content = typeof res.data === 'string' ? res.data : JSON.stringify(res.data, null, 2);
      setResult(content);
      toast.success('Content generated');
    } else {
      toast.error(res.error);
    }
    setIsGenerating(false);
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleUse = () => {
    if (result) {
      onUseContent(result);
      toast.success('Content applied');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <span className="font-medium text-slate-900 dark:text-white">AI Assistant</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-slate-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-400" />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">
          <BrandVoiceSelector selected={selectedVoice} onSelect={setSelectedVoice} />

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={placeholder}
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm resize-none"
          />

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Generating...</>
            ) : (
              <><Sparkles className="h-4 w-4" />Generate</>
            )}
          </button>

          {result && (
            <div className="space-y-2">
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 max-h-60 overflow-y-auto">
                <pre className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-sans">
                  {result}
                </pre>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleUse}
                  className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Use This
                </button>
                <button
                  onClick={handleCopy}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4 text-slate-400" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
