"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import type { Order, OrderStatus } from "@/lib/types";
import { Clock, ChefHat, Check, RefreshCw, Bell } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { subscribeToKitchenOrders, updateOrderStatus } from "@/lib/services";

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    // Optimized: Only fetch pending/in-prep orders
    const unsub = subscribeToKitchenOrders((data) => {
      setOrders(data);
      setLastUpdate(new Date());
    });
    return () => unsub();
  }, []);

  // Filter to only show pending and in-preparation orders
  const kitchenOrders = orders.filter(
    (o) => o.status === "pending" || o.status === "in-preparation"
  );

  const pendingOrders = kitchenOrders.filter((o) => o.status === "pending");
  const inPrepOrders = kitchenOrders.filter((o) => o.status === "in-preparation");

  const formatTime = (date: Date) => {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff} min`;
    return `${Math.floor(diff / 60)}h ${diff % 60}m`;
  };

  const getUrgencyColor = (date: Date) => {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (diff > 30) return "text-destructive";
    if (diff > 15) return "text-warning";
    return "text-muted-foreground";
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      if (newStatus === "in-preparation") {
        toast.success("Order started - now preparing");
      } else if (newStatus === "served") {
        toast.success("Order marked as served");
      }
    } catch (error) {
      toast.error("Failed to update order status");
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Realtime, so just visual feedback
    setTimeout(() => {
      setLastUpdate(new Date());
      setIsRefreshing(false);
      toast.success("Orders refreshed");
    }, 500);
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: `url('/dashboard_shadow_bg.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Shadow Overlay (Vignette) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.6)_100%)] pointer-events-none" />

      {/* Existing Linear Gradient */}
      <div className="absolute inset-0 bg-linear-to-b from-black/20 via-black/40 to-black/60 backdrop-blur-sm" />

      <div className="relative z-10 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2 drop-shadow-md text-shadow-strong">
              <ChefHat className="h-7 w-7 text-primary" />
              Kitchen Display
            </h1>
            <p className="text-white/80 drop-shadow-sm">
              Real-time view of incoming orders
            </p>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-xs text-white/60">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
            <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing} className="bg-black/20 border-white/20 text-white hover:bg-white/10 hover:text-white">
              <RefreshCw className={cn("mr-2 h-4 w-4", isRefreshing && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Summary */}
        <div className="grid gap-4 grid-cols-2">
          <Card className="border-warning/50 bg-black/40 backdrop-blur-md shadow-xl border-t-4 border-t-warning">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">Pending</p>
                  <p className="text-3xl font-bold text-warning drop-shadow-md">{pendingOrders.length}</p>
                </div>
                <Bell className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-info/50 bg-black/40 backdrop-blur-md shadow-xl border-t-4 border-t-info">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">In Preparation</p>
                  <p className="text-3xl font-bold text-info drop-shadow-md">{inPrepOrders.length}</p>
                </div>
                <ChefHat className="h-8 w-8 text-info" />
              </div>
            </CardContent>
          </Card>
        </div>

        {kitchenOrders.length === 0 ? (
          <Card className="border-white/10 bg-black/40 backdrop-blur-md shadow-xl">
            <CardContent className="py-16">
              <EmptyState
                icon={ChefHat}
                title="All caught up!"
                description="No pending orders at the moment. New orders will appear here automatically."
                className="text-white/80"
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Pending Orders */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2 drop-shadow-sm">
                <div className="h-3 w-3 rounded-full bg-warning animate-pulse shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
                New Orders
                {pendingOrders.length > 0 && (
                  <Badge className="bg-warning/20 text-warning border-warning/30">
                    {pendingOrders.length}
                  </Badge>
                )}
              </h2>
              {pendingOrders.length === 0 ? (
                <Card className="border-white/10 bg-black/20 border-dashed backdrop-blur-sm">
                  <CardContent className="py-8 text-center">
                    <p className="text-white/50">No new orders</p>
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
              <h2 className="text-lg font-semibold text-white flex items-center gap-2 drop-shadow-sm">
                <div className="h-3 w-3 rounded-full bg-info animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                In Preparation
                {inPrepOrders.length > 0 && (
                  <Badge className="bg-info/20 text-info border-info/30">
                    {inPrepOrders.length}
                  </Badge>
                )}
              </h2>
              {inPrepOrders.length === 0 ? (
                <Card className="border-white/10 bg-black/20 border-dashed backdrop-blur-sm">
                  <CardContent className="py-8 text-center">
                    <p className="text-white/50">No orders being prepared</p>
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
        "border-2 transition-all backdrop-blur-md shadow-lg",
        order.status === "pending"
          ? "border-warning/50 bg-black/40 hover:bg-black/50 hover:shadow-warning/20"
          : "border-info/50 bg-black/40 hover:bg-black/50 hover:shadow-info/20"
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
              <CardTitle className="text-lg text-white drop-shadow-sm">
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
              className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/5"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                {item.quantity}x
              </div>
              <div className="flex-1">
                <p className="font-medium text-white text-lg">{item.menuItem.name}</p>
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
