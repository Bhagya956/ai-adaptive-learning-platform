interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-10 h-10" };

export default function LoadingSpinner({ size = "md", className = "" }: SpinnerProps) {
  return (
    <div
      className={[
        "animate-spin rounded-full border-2 border-brand-100 border-t-brand-500",
        sizeMap[size],
        className,
      ].join(" ")}
      role="status"
      aria-label="Loading"
    />
  );
}

export function PageLoader({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-3 border-brand-100 border-t-brand-500 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-brand-400 to-blue-400 opacity-30 animate-pulse" />
        </div>
      </div>
      <p className="text-sm text-text-muted font-medium">{message}</p>
    </div>
  );
}

export function InlineLoader({ message }: { message?: string }) {
  return (
    <div className="flex items-center gap-2.5 py-6 justify-center text-text-secondary">
      <LoadingSpinner size="sm" />
      {message && <span className="text-sm">{message}</span>}
    </div>
  );
}

/** Skeleton block for loading states */
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gradient-to-r from-surface-3 via-surface-4 to-surface-3 rounded-xl ${className}`} />
  );
}
