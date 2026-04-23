import { cn } from "@/lib/utils";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

type Status = "ok" | "attention" | "risk";

const statusConfig: Record<
  Status,
  { label: string; color: string; bgColor: string; icon: typeof CheckCircle2 }
> = {
  ok: {
    label: "OK",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10 border-emerald-500/20",
    icon: CheckCircle2,
  },
  attention: {
    label: "Atenção",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10 border-amber-500/20",
    icon: AlertTriangle,
  },
  risk: {
    label: "Risco",
    color: "text-red-400",
    bgColor: "bg-red-500/10 border-red-500/20",
    icon: XCircle,
  },
};

interface StatusCardProps {
  title: string;
  status: Status;
  description?: string;
  className?: string;
}

export function StatusCard({
  title,
  status,
  description,
  className,
}: StatusCardProps) {
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <div
      className={cn(
        "rounded-xl border p-5 transition-all duration-300",
        config.bgColor,
        className
      )}
    >
      <div className="flex items-start gap-4">
        <StatusIcon className={cn("h-6 w-6 shrink-0 mt-0.5", config.color)} />
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-white">{title}</h3>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                config.color,
                status === "ok" && "bg-emerald-500/20",
                status === "attention" && "bg-amber-500/20",
                status === "risk" && "bg-red-500/20"
              )}
            >
              {config.label}
            </span>
          </div>
          {description && (
            <p className="text-xs leading-relaxed text-gray-400">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
