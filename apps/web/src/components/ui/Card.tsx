import { forwardRef } from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
  variant?: "default" | "gradient" | "glass";
}

const paddingClasses = {
  none: "",
  sm:   "p-4",
  md:   "p-5",
  lg:   "p-6",
};

const variantClasses = {
  default:  "bg-white border border-border shadow-sm",
  gradient: "bg-gradient-to-br from-brand-50 to-blue-50 border border-brand-100 shadow-sm",
  glass:    "glass-card border border-white/60 shadow-md",
};

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ padding = "md", hover = false, variant = "default", className = "", children, ...props }, ref) => (
    <div
      ref={ref}
      className={[
        "rounded-2xl",
        variantClasses[variant],
        paddingClasses[padding],
        hover ? "hover:shadow-md hover:border-brand-200 cursor-pointer" : "",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </div>
  )
);
Card.displayName = "Card";

export function CardHeader({ className = "", children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`mb-4 ${className}`} {...props}>{children}</div>;
}

export function CardTitle({ className = "", children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={`text-sm font-semibold text-text-primary tracking-tight ${className}`} {...props}>{children}</h3>;
}

export function CardDescription({ className = "", children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={`text-sm text-text-secondary mt-0.5 ${className}`} {...props}>{children}</p>;
}

export default Card;
