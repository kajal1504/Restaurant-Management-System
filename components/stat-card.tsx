"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  isLoading?: boolean;
  className?: string;
  trendClassName?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  isLoading,
  className,
  trendClassName,
}: StatCardProps) {
  if (isLoading) {
    return (
      <Card className={cn("border-white/10 bg-black/40 backdrop-blur-md shadow-xl", className)}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24 bg-white/10" />
              <Skeleton className="h-8 w-16 bg-white/10" />
              <Skeleton className="h-3 w-20 bg-white/10" />
            </div>
            <Skeleton className="h-10 w-10 rounded-lg bg-white/10" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-white/10 bg-black/40 backdrop-blur-md shadow-xl hover:bg-black/50 transition-colors duration-300", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-white/70">{title}</p>
            <p className="text-2xl font-bold text-white drop-shadow-md">{value}</p>
            {subtitle && (
              <p className="text-xs text-white/50">{subtitle}</p>
            )}
            {trend && (
              <p
                className={cn(
                  "text-xs font-medium",
                  trendClassName || (trend.isPositive ? "text-emerald-400" : "text-rose-400")
                )}
              >
                {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}% from yesterday
              </p>
            )}
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm shadow-inner">
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
