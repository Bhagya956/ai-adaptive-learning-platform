interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showLabel?: boolean;
  color?: "brand" | "success" | "warning" | "danger" | "blue" | "purple";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const colorClasses: Record<NonNullable<ProgressBarProps["color"]>, string> = {
  brand:   "bg-gradient-to-r from-brand-500 to-blue-400",
  success: "bg-gradient-to-r from-emerald-500 to-teal-400",
  warning: "bg-gradient-to-r from-amber-500 to-orange-400",
  danger:  "bg-gradient-to-r from-red-500 to-rose-400",
  blue:    "bg-gradient-to-r from-blue-500 to-cyan-400",
  purple:  "bg-gradient-to-r from-purple-500 to-violet-400",
};

const heightClasses = { sm: "h-1.5", md: "h-2", lg: "h-3" };

export default function ProgressBar({
  value, max = 100, label, showLabel = false,
  color = "brand", size = "md", className = "",
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={`w-full ${className}`}>
      {(label || showLabel) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs font-medium text-text-secondary">{label}</span>}
          {showLabel && <span className="text-xs font-semibold text-text-primary">{Math.round(pct)}%</span>}
        </div>
      )}
      <div className={`w-full bg-surface-3 rounded-full ${heightClasses[size]} overflow-hidden`}>
        <div
          className={`${colorClasses[color]} ${heightClasses[size]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
}
