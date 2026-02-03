import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const variants: Record<string, string> = {
    pending: "bg-slate-100 text-slate-700 border-slate-200",
    "in-preparation": "bg-blue-100 text-blue-700 border-blue-200",
    served: "bg-emerald-100 text-emerald-700 border-emerald-200",
    completed: "bg-slate-900 text-white",
    paid: "bg-green-100 text-green-700 border-green-200",
  };

  return (
    <Badge variant="outline" className={cn("capitalize font-bold", variants[status.toLowerCase()] || "", className)}>
      {status.replace("-", " ")}
    </Badge>
  );
}