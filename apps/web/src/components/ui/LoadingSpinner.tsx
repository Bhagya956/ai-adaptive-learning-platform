interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-10 h-10",
};

export default function LoadingSpinner({ size = "md", className = "" }: SpinnerProps) {
  return (
    <div
      className={[
        "animate-spin rounded-full border-2 border-brand-200 border-t-brand-600",
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
      <LoadingSpinner size="lg" />
      <p className="text-sm text-text-secondary">{message}</p>
    </div>
  );
}

export function InlineLoader({ message }: { message?: string }) {
  return (
    <div className="flex items-center gap-2 py-8 justify-center text-text-secondary">
      <LoadingSpinner size="sm" />
      {message && <span className="text-sm">{message}</span>}
    </div>
  );
}
