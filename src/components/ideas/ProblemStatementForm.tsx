"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface ProblemStatementFormProps {
  onSubmit: (data: { statement: string; impact: string; frequency: string }) => void;
  onCancel: () => void;
}

export function ProblemStatementForm({ onSubmit, onCancel }: ProblemStatementFormProps) {
  const [statement, setStatement] = useState("");
  const [impact, setImpact] = useState("MEDIUM");
  const [frequency, setFrequency] = useState("OCCASIONAL");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ statement, impact, frequency });
  };

  return (
    <div className="bg-white border rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-semibold text-slate-900">Add Problem Statement</h4>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Problem Statement</label>
          <textarea
            value={statement}
            onChange={(e) => setStatement(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            rows={3}
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Impact</label>
          <select
            value={impact}
            onChange={(e) => setImpact(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Frequency</label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="RARE">Rare</option>
            <option value="OCCASIONAL">Occasional</option>
            <option value="FREQUENT">Frequent</option>
            <option value="CONSTANT">Constant</option>
          </select>
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
            Add Problem
          </button>
        </div>
      </form>
    </div>
  );
}
