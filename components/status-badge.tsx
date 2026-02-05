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
        return "bg-green-500/20 text-green-500 border-green-500/30 hover:bg-green-500/30";
      case "occupied":
        return "bg-red-500/20 text-red-500 border-red-500/30 hover:bg-red-500/30";
      case "reserved":
        return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30 hover:bg-yellow-500/30";
      // Order statuses
      case "pending":
        return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30 hover:bg-yellow-500/30";
      case "in-preparation":
        return "bg-blue-500/20 text-blue-500 border-blue-500/30 hover:bg-blue-500/30";
      case "served":
        return "bg-primary/20 text-primary border-primary/30 hover:bg-primary/30";
      case "completed":
        return "bg-green-500/20 text-green-500 border-green-500/30 hover:bg-green-500/30";
      case "cancelled":
        return "bg-red-500/20 text-red-500 border-red-500/30 hover:bg-red-500/30";
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
