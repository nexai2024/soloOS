"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface CompetitorFormProps {
  onSubmit: (data: { name: string; url?: string; strengths: string[]; weaknesses: string[] }) => void;
  onCancel: () => void;
}

export function CompetitorForm({ onSubmit, onCancel }: CompetitorFormProps) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [strengths, setStrengths] = useState("");
  const [weaknesses, setWeaknesses] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      url: url || undefined,
      strengths: strengths.split('\n').filter(s => s.trim()),
      weaknesses: weaknesses.split('\n').filter(w => w.trim())
    });
  };

  return (
    <div className="bg-white border rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-semibold text-slate-900">Add Competitor</h4>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">URL (optional)</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Strengths (one per line)</label>
          <textarea
            value={strengths}
            onChange={(e) => setStrengths(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            rows={3}
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Weaknesses (one per line)</label>
          <textarea
            value={weaknesses}
            onChange={(e) => setWeaknesses(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            rows={3}
            required
          />
        </div>
        
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Add Competitor
          </button>
        </div>
      </form>
    </div>
  );
}
