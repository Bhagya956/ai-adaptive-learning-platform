import { LucideIcon } from "lucide-react";
import Link from "next/link";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: { value: string; up?: boolean };
  href?: string;
  description?: string;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  iconColor = "text-brand-600",
  iconBg = "bg-brand-50",
  trend,
  href,
  description,
}: StatCardProps) {
  const content = (
    <div className="bg-white rounded-2xl border border-border p-5 shadow-sm hover:shadow-md hover:border-brand-100 transition-all duration-200 group">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wide truncate mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-text-primary tabular-nums">
            {value}
          </p>
          {description && (
            <p className="text-xs text-text-muted mt-0.5">{description}</p>
          )}
          {trend && (
            <p className={`text-xs font-medium mt-1 ${trend.up ? "text-success" : "text-danger"}`}>
              {trend.up ? "↑" : "↓"} {trend.value}
            </p>
          )}
        </div>
        <div className={`p-2.5 rounded-xl ${iconBg} ${iconColor} ml-3 shrink-0 group-hover:scale-105 transition-transform`}>
          <Icon size={18} />
        </div>
      </div>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
