import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center border-2 border-dashed rounded-2xl border-slate-100">
      <div className="p-4 bg-slate-50 rounded-full mb-4">
        <Icon className="h-10 w-10 text-slate-400" />
      </div>
      <h3 className="text-xl font-bold text-slate-900">{title}</h3>
      <p className="text-slate-500 mt-2 max-w-[250px]">{description}</p>
      
      {/* Added logic to render the action button if provided */}
      {action && (
        <Button onClick={action.onClick} className="mt-6">
          {action.label}
        </Button>
      )}
    </div>
  );
}