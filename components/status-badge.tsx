"use client";

import { Badge } from "@/components/ui/badge";
import type { TableStatus, OrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: TableStatus | OrderStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusStyles = () => {
    switch (status) {
      // Table statuses
      case "available":
        return "bg-success/20 text-success border-success/30 hover:bg-success/30";
      case "occupied":
        return "bg-destructive/20 text-destructive border-destructive/30 hover:bg-destructive/30";
      case "reserved":
        return "bg-warning/20 text-warning border-warning/30 hover:bg-warning/30";
      // Order statuses
      case "pending":
        return "bg-warning/20 text-warning border-warning/30 hover:bg-warning/30";
      case "in-preparation":
        return "bg-info/20 text-info border-info/30 hover:bg-info/30";
      case "served":
        return "bg-primary/20 text-primary border-primary/30 hover:bg-primary/30";
      case "completed":
        return "bg-success/20 text-success border-success/30 hover:bg-success/30";
      case "cancelled":
        return "bg-destructive/20 text-destructive border-destructive/30 hover:bg-destructive/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatStatus = (status: string) => {
    return status.split("-").map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(" ");
  };

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "font-medium text-xs border transition-colors",
        getStatusStyles(),
        className
      )}
    >
      {formatStatus(status)}
    </Badge>
  );
}
