interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "brand";
  size?: "sm" | "md";
}

const variantClasses = {
  default: "bg-surface-3 text-text-secondary border border-border",
  success: "bg-success-bg text-success border border-green-200",
  warning: "bg-warning-bg text-warning border border-amber-200",
  danger: "bg-danger-bg text-danger border border-red-200",
  info: "bg-info-bg text-info border border-blue-200",
  brand: "bg-brand-50 text-brand-700 border border-brand-200",
};

const sizeClasses = {
  sm: "text-xs px-2 py-0.5",
  md: "text-xs px-2.5 py-1",
};

export default function Badge({
  variant = "default",
  size = "md",
  className = "",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center font-medium rounded-full",
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </span>
  );
}
