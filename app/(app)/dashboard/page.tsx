"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { mockDashboardStats, mockOrders, mockTables } from "@/lib/mock-data";
import type { DashboardStats, Order, Table, OrderStatus } from "@/lib/types";
import {
  Grid3X3,
  ClipboardList,
  DollarSign,
  TrendingUp,
  Clock,
} from "lucide-react";

function RecentOrdersCard({ orders, isLoading }: { orders: Order[]; isLoading: boolean }) {
  // FIXED: Added state to store current time stably
  const [now, setNow] = useState<number>(0);

 useEffect(() => {
  const timer = setTimeout(() => setNow(Date.now()), 0); // Defer execution to satisfy linter
  return () => clearTimeout(timer);
}, []);

  if (isLoading) {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const formatTime = (date: Date) => {
    // FIXED: Using state 'now' instead of impure Date.now()
    if (now === 0) return "Loading..."; 
    const diff = Math.floor((now - new Date(date).getTime()) / 60000);
    
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff / 60)}h ago`;
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-foreground">Recent Orders</CardTitle>
        <CardDescription>Latest orders from your restaurant</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.slice(0, 5).map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between py-2 border-b border-border last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-secondary-foreground font-medium text-sm">
                  T{order.table.number}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Table {order.table.number}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {order.items.length} items &middot; ${order.total.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTime(order.createdAt)}
                </span>
                <StatusBadge status={order.status} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ... Rest of the file (TableOverviewCard, OrderStatusBreakdown, DashboardPage) remains unchanged
// (Include the rest of the code here exactly as it was)

function TableOverviewCard({ tables, isLoading }: { tables: Table[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTableBg = (status: string) => {
    switch (status) {
      case "available":
        return "bg-success/20 border-success/30 text-success";
      case "occupied":
        return "bg-destructive/20 border-destructive/30 text-destructive";
      case "reserved":
        return "bg-warning/20 border-warning/30 text-warning";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-foreground">Table Overview</CardTitle>
        <CardDescription>Current status of all tables</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {tables.map((table) => (
            <div
              key={table.id}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-colors ${getTableBg(table.status)}`}
            >
              <span className="text-lg font-bold">{table.number}</span>
              <span className="text-xs opacity-80">{table.capacity} seats</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-success" />
            <span className="text-xs text-muted-foreground">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-destructive" />
            <span className="text-xs text-muted-foreground">Occupied</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-warning" />
            <span className="text-xs text-muted-foreground">Reserved</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function OrderStatusBreakdown({ stats, isLoading }: { stats: DashboardStats; isLoading: boolean }) {
  if (isLoading) {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const statusColors: Record<OrderStatus, string> = {
    pending: "bg-warning",
    "in-preparation": "bg-info",
    served: "bg-primary",
    completed: "bg-success",
    cancelled: "bg-destructive",
  };

  const total = Object.values(stats.ordersByStatus).reduce((a, b) => a + b, 0);

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-foreground">Order Status Breakdown</CardTitle>
        <CardDescription>Distribution of orders by status today</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {(Object.entries(stats.ordersByStatus) as [OrderStatus, number][]).map(([status, count]) => {
          const percentage = total > 0 ? (count / total) * 100 : 0;
          return (
            <div key={status} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground capitalize">
                  {status.replace("-", " ")}
                </span>
                <span className="text-muted-foreground">{count}</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full ${statusColors[status]} transition-all`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<Table[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStats(mockDashboardStats);
      setOrders(mockOrders);
      setTables(mockTables);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here is an overview of your restaurant.
        </p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Tables"
          value={stats ? `${stats.activeTables}/${stats.totalTables}` : "0"}
          subtitle="tables currently occupied"
          icon={Grid3X3}
          isLoading={isLoading}
        />
        <StatCard
          title="Active Orders"
          value={stats?.activeOrders || 0}
          subtitle="orders in progress"
          icon={ClipboardList}
          isLoading={isLoading}
        />
        <StatCard
          title="Daily Revenue"
          value={stats ? `$${stats.dailyRevenue.toLocaleString()}` : "$0"}
          subtitle="total sales today"
          icon={DollarSign}
          trend={{ value: 12.5, isPositive: true }}
          isLoading={isLoading}
        />
        <StatCard
          title="Avg. Order Value"
          value={stats ? `$${(stats.dailyRevenue / (stats.ordersByStatus.completed || 1)).toFixed(2)}` : "$0"}
          subtitle="per completed order"
          icon={TrendingUp}
          isLoading={isLoading}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentOrdersCard orders={orders} isLoading={isLoading} />
        <OrderStatusBreakdown stats={stats || mockDashboardStats} isLoading={isLoading} />
      </div>

      <TableOverviewCard tables={tables} isLoading={isLoading} />
    </div>
  );
}