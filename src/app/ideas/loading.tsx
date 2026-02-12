import { Loader2 } from "lucide-react";

export default function IdeasLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-slate-600 dark:text-slate-400">Loading ideas...</p>
      </div>
    </div>
  );
}
