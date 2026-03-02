import { Rocket } from "lucide-react";

interface PromoteButtonProps {
  onClick: () => void;
  disabled: boolean;
  className?: string;
}

export function PromoteButton({ onClick, disabled, className = "" }: PromoteButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold transition ${className}`}
    >
      <Rocket className="w-5 h-5" />
      {disabled ? "Complete Validation to Promote" : "Promote to Project"}
    </button>
  );
}