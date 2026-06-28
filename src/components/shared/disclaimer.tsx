import { Info } from "lucide-react";

interface DisclaimerProps {
  className?: string;
  compact?: boolean;
}

export function Disclaimer({ className = "", compact = false }: DisclaimerProps) {
  const text =
    "LifeGPS readings are for entertainment, self-reflection, and personal growth only. They do not predict the future and should not be used as medical, legal, financial, psychological, or professional advice.";

  if (compact) {
    return (
      <p className={`text-xs text-muted-foreground ${className}`}>{text}</p>
    );
  }

  return (
    <div
      className={`flex gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 ${className}`}
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
      <p className="text-sm leading-relaxed text-muted-foreground">{text}</p>
    </div>
  );
}
