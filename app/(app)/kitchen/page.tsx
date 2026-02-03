"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { mockOrders } from "@/lib/mock-data";
import type { Order, OrderStatus } from "@/lib/types";
import { Clock, ChefHat, Check, RefreshCw, Bell } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Filter to only show pending and in-preparation orders
  const kitchenOrders = orders.filter(
    (o) => o.status === "pending" || o.status === "in-preparation"
  );

  const pendingOrders = kitchenOrders.filter((o) => o.status === "pending");
  const inPrepOrders = kitchenOrders.filter((o) => o.status === "in-preparation");

  const formatTime = (date: Date) => {
    const diff = Math.floor((Date.now() - date.getTime()) / 60000);
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff} min`;
    return `${Math.floor(diff / 60)}h ${diff % 60}m`;
  };

  const getUrgencyColor = (date: Date) => {
    const diff = Math.floor((Date.now() - date.getTime()) / 60000);
    if (diff > 30) return "text-destructive";
    if (diff > 15) return "text-warning";
    return "text-muted-foreground";
  };

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: newStatus, updatedAt: new Date() } : o
      )
    );
    if (newStatus === "in-preparation") {
      toast.success("Order started - now preparing");
    } else if (newStatus === "served") {
      toast.success("Order marked as served");
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastUpdate(new Date());
      setIsRefreshing(false);
      toast.success("Orders refreshed");
    }, 1000);
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ChefHat className="h-7 w-7 text-primary" />
            Kitchen Display
          </h1>
          <p className="text-muted-foreground">
            Real-time view of incoming orders
          </p>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-xs text-muted-foreground">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={cn("mr-2 h-4 w-4", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-4 grid-cols-2">
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-3xl font-bold text-warning">{pendingOrders.length}</p>
              </div>
              <Bell className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-info/30 bg-info/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Preparation</p>
                <p className="text-3xl font-bold text-info">{inPrepOrders.length}</p>
              </div>
              <ChefHat className="h-8 w-8 text-info" />
            </div>
          </CardContent>
        </Card>
      </div>

      {kitchenOrders.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="py-16">
            <EmptyState
              icon={ChefHat}
              title="All caught up!"
              description="No pending orders at the moment. New orders will appear here automatically."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Pending Orders */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-warning animate-pulse" />
              New Orders
              {pendingOrders.length > 0 && (
                <Badge className="bg-warning/20 text-warning border-warning/30">
                  {pendingOrders.length}
                </Badge>
              )}
            </h2>
            {pendingOrders.length === 0 ? (
              <Card className="border-border bg-card border-dashed">
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No new orders</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingOrders.map((order) => (
                  <KitchenOrderCard
                    key={order.id}
                    order={order}
                    onStart={() => handleStatusChange(order.id, "in-preparation")}
                    formatTime={formatTime}
                    getUrgencyColor={getUrgencyColor}
                  />
                ))}
              </div>
            )}
          </div>

          {/* In Preparation */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-info animate-pulse" />
              In Preparation
              {inPrepOrders.length > 0 && (
                <Badge className="bg-info/20 text-info border-info/30">
                  {inPrepOrders.length}
                </Badge>
              )}
            </h2>
            {inPrepOrders.length === 0 ? (
              <Card className="border-border bg-card border-dashed">
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No orders being prepared</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {inPrepOrders.map((order) => (
                  <KitchenOrderCard
                    key={order.id}
                    order={order}
                    onComplete={() => handleStatusChange(order.id, "served")}
                    formatTime={formatTime}
                    getUrgencyColor={getUrgencyColor}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function KitchenOrderCard({
  order,
  onStart,
  onComplete,
  formatTime,
  getUrgencyColor,
}: {
  order: Order;
  onStart?: () => void;
  onComplete?: () => void;
  formatTime: (date: Date) => string;
  getUrgencyColor: (date: Date) => string;
}) {
  return (
    <Card
      className={cn(
        "border-2 transition-all",
        order.status === "pending"
          ? "border-warning/50 bg-warning/5"
          : "border-info/50 bg-info/5"
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-xl font-bold text-2xl",
                order.status === "pending"
                  ? "bg-warning/20 text-warning"
                  : "bg-info/20 text-info"
              )}
            >
              T{order.table.number}
            </div>
            <div>
              <CardTitle className="text-lg text-foreground">
                Table {order.table.number}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={order.status} />
                <span className={cn("text-sm flex items-center gap-1", getUrgencyColor(order.createdAt))}>
                  <Clock className="h-3 w-3" />
                  {formatTime(order.createdAt)}
                </span>
              </div>
            </div>
          </div>
          <Badge variant="secondary" className="text-lg px-3 py-1">
            #{order.id}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Order Items */}
        <div className="space-y-2">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-background/50"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                {item.quantity}x
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground text-lg">{item.menuItem.name}</p>
                {item.notes && (
                  <p className="text-sm text-warning mt-1 bg-warning/10 px-2 py-1 rounded">
                    Note: {item.notes}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        {onStart && (
          <Button onClick={onStart} className="w-full h-12 text-lg bg-warning hover:bg-warning/90">
            <ChefHat className="mr-2 h-5 w-5" />
            Start Preparing
          </Button>
        )}
        {onComplete && (
          <Button onClick={onComplete} className="w-full h-12 text-lg bg-success hover:bg-success/90">
            <Check className="mr-2 h-5 w-5" />
            Mark as Ready
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
