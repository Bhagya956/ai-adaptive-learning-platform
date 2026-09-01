import { forwardRef } from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
}

const paddingClasses = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ padding = "md", hover = false, className = "", children, ...props }, ref) => (
    <div
      ref={ref}
      className={[
        "bg-surface rounded-xl border border-border shadow-sm",
        paddingClasses[padding],
        hover ? "hover:shadow-md hover:border-brand-200 transition-all duration-200 cursor-pointer" : "",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </div>
  )
);

Card.displayName = "Card";

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
export function CardHeader({ className = "", children, ...props }: CardHeaderProps) {
  return (
    <div className={`mb-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}
export function CardTitle({ className = "", children, ...props }: CardTitleProps) {
  return (
    <h3 className={`text-base font-semibold text-text-primary ${className}`} {...props}>
      {children}
    </h3>
  );
}

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}
export function CardDescription({ className = "", children, ...props }: CardDescriptionProps) {
  return (
    <p className={`text-sm text-text-secondary mt-0.5 ${className}`} {...props}>
      {children}
    </p>
  );
}

export default Card;
