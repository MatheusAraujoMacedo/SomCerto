import { cn } from "@/lib/utils";
import { AlertTriangle, Info, CheckCircle2, XCircle } from "lucide-react";

type AlertType = "success" | "warning" | "error" | "info";

const alertConfig: Record<
  AlertType,
  { color: string; bgColor: string; icon: typeof Info }
> = {
  success: {
    color: "text-emerald-400",
    bgColor: "border-emerald-500/20 bg-emerald-500/5",
    icon: CheckCircle2,
  },
  warning: {
    color: "text-amber-400",
    bgColor: "border-amber-500/20 bg-amber-500/5",
    icon: AlertTriangle,
  },
  error: {
    color: "text-red-400",
    bgColor: "border-red-500/20 bg-red-500/5",
    icon: XCircle,
  },
  info: {
    color: "text-blue-400",
    bgColor: "border-blue-500/20 bg-blue-500/5",
    icon: Info,
  },
};

interface AlertCardProps {
  type: AlertType;
  title: string;
  description: string;
  className?: string;
}

export function AlertCard({
  type,
  title,
  description,
  className,
}: AlertCardProps) {
  const config = alertConfig[type];
  const AlertIcon = config.icon;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border p-4 transition-all duration-200",
        config.bgColor,
        className
      )}
    >
      <AlertIcon className={cn("h-4 w-4 shrink-0 mt-0.5", config.color)} />
      <div className="min-w-0 space-y-0.5">
        <p className={cn("text-sm font-medium", config.color)}>{title}</p>
        <p className="text-xs leading-relaxed text-gray-400">{description}</p>
      </div>
    </div>
  );
}
