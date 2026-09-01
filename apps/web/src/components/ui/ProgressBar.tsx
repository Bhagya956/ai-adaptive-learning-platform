interface ProgressBarProps {
  value: number; // 0–100
  max?: number;
  label?: string;
  showLabel?: boolean;
  color?: "brand" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const colorClasses = {
  brand: "bg-brand-600",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

const heightClasses = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-3.5",
};

export default function ProgressBar({
  value,
  max = 100,
  label,
  showLabel = false,
  color = "brand",
  size = "md",
  className = "",
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={`w-full ${className}`}>
      {(label || showLabel) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs font-medium text-text-secondary">{label}</span>}
          {showLabel && (
            <span className="text-xs font-semibold text-text-primary">{Math.round(pct)}%</span>
          )}
        </div>
      )}
      <div className={`w-full bg-surface-3 rounded-full ${heightClasses[size]}`}>
        <div
          className={`${colorClasses[color]} ${heightClasses[size]} rounded-full transition-all duration-500`}
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
