"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface ValidationChecklistFormProps {
  onSubmit: (data: { task: string }) => void;
  onCancel: () => void;
}

export function ValidationChecklistForm({ onSubmit, onCancel }: ValidationChecklistFormProps) {
  const [task, setTask] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ task });
    setTask("");
  };

  return (
    <div className="bg-white border rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-semibold text-slate-900">Add Validation Task</h4>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Task</label>
          <input
            type="text"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="e.g., Interview 10 potential users"
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
            Add Task
          </button>
        </div>
      </form>
    </div>
  );
}
