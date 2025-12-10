import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  variant?: "default" | "primary" | "gold";
}

export function StatsCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  variant = "default",
}: StatsCardProps) {
  return (
    <div className="bg-card rounded-2xl p-6 border border-border card-hover animate-slide-up">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
          {change && (
            <p
              className={cn(
                "mt-1 text-sm font-medium",
                changeType === "positive" && "text-green-600",
                changeType === "negative" && "text-destructive",
                changeType === "neutral" && "text-muted-foreground"
              )}
            >
              {change}
            </p>
          )}
        </div>
        <div
          className={cn(
            "p-3 rounded-xl",
            variant === "default" && "bg-secondary",
            variant === "primary" && "gradient-primary",
            variant === "gold" && "gradient-gold"
          )}
        >
          <Icon
            className={cn(
              "h-6 w-6",
              variant === "default" && "text-foreground",
              variant === "primary" && "text-primary-foreground",
              variant === "gold" && "text-navy"
            )}
          />
        </div>
      </div>
    </div>
  );
}
