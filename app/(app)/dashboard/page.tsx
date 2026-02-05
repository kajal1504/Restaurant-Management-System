"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardStats, Order, Table, OrderStatus } from "@/lib/types";
import {
  Grid3X3,
  ClipboardList,
  DollarSign,
  TrendingUp,
  Clock,
} from "lucide-react";
import { subscribeToTodaysOrders, subscribeToTables } from "@/lib/services";

function RecentOrdersCard({ orders, isLoading }: { orders: Order[]; isLoading: boolean }) {
  const [now, setNow] = useState<number>(0);

  useEffect(() => {
    const timer = setTimeout(() => setNow(Date.now()), 0);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      // FIXED: hover:-translate-y-1
      <Card className="border-border bg-card shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1 animate-in fade-in">
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
    if (now === 0) return "Loading...";
    const diff = Math.floor((now - new Date(date).getTime()) / 60000);

    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff / 60)}h ago`;
  };

  return (
    // FIXED: Transparent Shadow Glass Style
    <Card className="border-white/10 bg-black/40 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300 animate-in fade-in delay-100">
      <CardHeader>
        <CardTitle className="text-white drop-shadow-md text-shadow-strong text-balance">Recent Orders</CardTitle>
        <CardDescription className="text-white/70 drop-shadow-sm text-shadow-sm">Latest orders from your restaurant</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.slice(0, 5).map((order, index) => (
            <div
              key={order.id}
              className="flex items-center justify-between py-3 px-2 border-b border-border/50 last:border-0 rounded-lg hover:bg-secondary/30 transition-all duration-200 cursor-pointer group animate-in fade-in"
              style={{ animationDelay: `${(index + 1) * 50}ms` }}
            >
              <div className="flex items-center gap-3">
                {/* FIXED: bg-linear-to-br */}
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-primary to-primary/80 text-primary-foreground font-semibold text-sm shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-200">
                  T{order.table.number}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-200">
                    Table {order.table.number}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {order.items.length} items &middot; ${order.total.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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

function TableOverviewCard({ tables, isLoading }: { tables: Table[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      // FIXED: hover:-translate-y-1
      <Card className="border-border bg-card/95 backdrop-blur-md shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1 animate-in fade-in">
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTableBg = (status: string) => {
    switch (status) {
      case "available":
        return "bg-emerald-500/20 border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/30 shadow-lg";
      case "occupied":
        return "bg-rose-500/20 border-rose-500/40 text-rose-600 hover:bg-rose-500/30 shadow-lg";
      case "reserved":
        return "bg-amber-500/20 border-amber-500/40 text-amber-600 hover:bg-amber-500/30 shadow-lg";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    // FIXED: Transparent Shadow Glass Style
    <Card className="border-white/10 bg-black/40 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300 animate-in fade-in delay-200">
      <CardHeader>
        <CardTitle className="text-white drop-shadow-md text-shadow-strong text-balance">Table Overview</CardTitle>
        <CardDescription className="text-white/70 drop-shadow-sm text-shadow-sm">Current status of all tables</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
          {tables.map((table, index) => (
            <div
              key={table.id}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-300 hover:scale-110 hover:shadow-xl cursor-pointer group animate-in fade-in ${getTableBg(table.status)}`}
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <span className="text-xl font-bold group-hover:scale-125 transition-transform duration-200">{table.number}</span>
              <span className="text-xs opacity-70 mt-1">{table.capacity} seats</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-8 mt-6 pt-6 border-t border-border/50">
          <div className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-200">
            <div className="h-3 w-3 rounded-full bg-emerald-500 shadow-md" />
            <span className="text-xs text-muted-foreground">Available</span>
          </div>
          <div className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-200">
            <div className="h-3 w-3 rounded-full bg-rose-500 shadow-md" />
            <span className="text-xs text-muted-foreground">Occupied</span>
          </div>
          <div className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-200">
            <div className="h-3 w-3 rounded-full bg-amber-500 shadow-md" />
            <span className="text-xs text-muted-foreground">Reserved</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function OrderStatusBreakdown({ stats, isLoading }: { stats: DashboardStats | null; isLoading: boolean }) {
  if (isLoading || !stats) {
    return (
      // FIXED: hover:-translate-y-1
      <Card className="border-border bg-card/95 backdrop-blur-md shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1 animate-in fade-in">
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const statusColors: Record<OrderStatus, string> = {
    pending: "bg-amber-400 shadow-md",
    "in-preparation": "bg-blue-400 shadow-md",
    served: "bg-purple-400 shadow-md",
    completed: "bg-emerald-500 shadow-md",
    cancelled: "bg-rose-500 shadow-md",
  };

  const total = Object.values(stats.ordersByStatus).reduce((a, b) => a + b, 0);

  return (
    // FIXED: Transparent Shadow Glass Style
    <Card className="border-white/10 bg-black/40 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300 animate-in fade-in delay-100">
      <CardHeader>
        <CardTitle className="text-white drop-shadow-md text-shadow-strong text-balance">Order Status Breakdown</CardTitle>
        <CardDescription className="text-white/70 drop-shadow-sm text-shadow-sm">Distribution of orders by status today</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {(Object.entries(stats.ordersByStatus) as [OrderStatus, number][]).map(([status, count], index) => {
          const percentage = total > 0 ? (count / total) * 100 : 0;
          return (
            <div key={status} className="space-y-2 animate-in fade-in" style={{ animationDelay: `${index * 50}ms` }}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground font-medium capitalize">
                  {status.replace("-", " ")}
                </span>
                <span className="text-muted-foreground font-semibold">{count}</span>
              </div>
              <div className="h-3 bg-secondary/50 rounded-full overflow-hidden shadow-inner">
                <div
                  className={`h-full ${statusColors[status as OrderStatus]} transition-all duration-500 rounded-full`}
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
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<Table[]>([]);

  useEffect(() => {
    const unsubOrders = subscribeToTodaysOrders((data) => {
      setOrders(data);
      setIsLoading(false);
    });
    const unsubTables = subscribeToTables((data) => setTables(data));

    return () => {
      unsubOrders();
      unsubTables();
    };
  }, []);

  const stats: DashboardStats = useMemo(() => {
    const activeTables = tables.filter(t => t.status !== "available").length;

    // Filter orders for "today"
    const today = new Date();
    const todaysOrders = orders.filter(o => {
      const d = new Date(o.createdAt);
      return d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear();
    });

    const activeOrders = todaysOrders.filter(o => o.status !== "completed" && o.status !== "cancelled").length;
    const dailyRevenue = todaysOrders.reduce((acc, o) => acc + o.total, 0);

    const ordersByStatus: Record<OrderStatus, number> = {
      "pending": 0,
      "in-preparation": 0,
      "served": 0,
      "completed": 0,
      "cancelled": 0
    };

    todaysOrders.forEach(o => {
      if (ordersByStatus[o.status] !== undefined) {
        ordersByStatus[o.status]++;
      }
    });

    return {
      activeTables,
      totalTables: tables.length,
      activeOrders,
      dailyRevenue,
      ordersByStatus
    };
  }, [orders, tables]);

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

      {/* Content */}
      <div className="relative z-10 p-6 md:p-8 lg:p-10 space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="animate-entry duration-700">
          <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-2xl text-shadow-strong tracking-tight">Dashboard</h1>
          <p className="text-lg text-white/90 drop-shadow-md mt-2 text-shadow-sm font-light">
            Welcome back! Here is an overview of your restaurant.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 animate-entry stagger-1">
          <StatCard
            title="Active Tables"
            value={stats ? `${stats.activeTables}/${stats.totalTables}` : "0"}
            subtitle="tables currently occupied"
            icon={Grid3X3}
            isLoading={isLoading}
            className="delay-100"
          />
          <StatCard
            title="Active Orders"
            value={stats?.activeOrders || 0}
            subtitle="orders in progress"
            icon={ClipboardList}
            isLoading={isLoading}
            className="delay-200"
          />
          <StatCard
            title="Daily Revenue"
            value={stats ? `$${stats.dailyRevenue.toLocaleString()}` : "$0"}
            subtitle="total sales today"
            icon={DollarSign}
            trend={{ value: 12.5, isPositive: true }}
            trendClassName="text-red-500"
            isLoading={isLoading}
            className="delay-300"
          />
          <StatCard
            title="Avg. Order Value"
            value={stats ? `$${(stats.dailyRevenue / (Math.max(stats.ordersByStatus.completed, 1))).toFixed(2)}` : "$0"}
            subtitle="per completed order"
            icon={TrendingUp}
            isLoading={isLoading}
            className="delay-400"
          />
        </div>

        {/* Main Cards Grid */}
        <div className="grid gap-6 lg:grid-cols-2 animate-entry stagger-2">
          <RecentOrdersCard orders={orders} isLoading={isLoading} />
          <OrderStatusBreakdown stats={stats} isLoading={isLoading} />
        </div>

        {/* Table Overview */}
        <div className="animate-entry stagger-3">
          <TableOverviewCard tables={tables} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}

































































































// "use client";

// import { useState, useEffect, useMemo } from "react";
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// import { StatCard } from "@/components/stat-card";
// import { StatusBadge } from "@/components/ui/status-badge";
// import { Skeleton } from "@/components/ui/skeleton";
// import type { DashboardStats, Order, Table, OrderStatus } from "@/lib/types";
// import {
//   Grid3X3,
//   ClipboardList,
//   DollarSign,
//   TrendingUp,
//   Clock,
// } from "lucide-react";
// import { subscribeToTodaysOrders, subscribeToTables } from "@/lib/services";

// function RecentOrdersCard({ orders, isLoading }: { orders: Order[]; isLoading: boolean }) {
//   const [now, setNow] = useState<number>(0);

//   useEffect(() => {
//     const timer = setTimeout(() => setNow(Date.now()), 0);
//     return () => clearTimeout(timer);
//   }, []);

//   if (isLoading) {
//     return (
//       <Card className="border-border bg-card">
//         <CardHeader>
//           <Skeleton className="h-5 w-32" />
//           <Skeleton className="h-4 w-48" />
//         </CardHeader>
//         <CardContent className="space-y-4">
//           {[1, 2, 3, 4].map((i) => (
//             <div key={i} className="flex items-center justify-between">
//               <Skeleton className="h-4 w-24" />
//               <Skeleton className="h-6 w-20" />
//             </div>
//           ))}
//         </CardContent>
//       </Card>
//     );
//   }

//   const formatTime = (date: Date) => {
//     if (now === 0) return "Loading...";
//     const diff = Math.floor((now - new Date(date).getTime()) / 60000);

//     if (diff < 1) return "Just now";
//     if (diff < 60) return `${diff}m ago`;
//     return `${Math.floor(diff / 60)}h ago`;
//   };

//   return (
//     <Card className="border-border bg-card">
//       <CardHeader>
//         <CardTitle className="text-foreground">Recent Orders</CardTitle>
//         <CardDescription>Latest orders from your restaurant</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <div className="space-y-4">
//           {orders.slice(0, 5).map((order) => (
//             <div
//               key={order.id}
//               className="flex items-center justify-between py-2 border-b border-border last:border-0"
//             >
//               <div className="flex items-center gap-3">
//                 <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-secondary-foreground font-medium text-sm">
//                   T{order.table.number}
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium text-foreground">
//                     Table {order.table.number}
//                   </p>
//                   <p className="text-xs text-muted-foreground">
//                     {order.items.length} items &middot; ${order.total.toFixed(2)}
//                   </p>
//                 </div>
//               </div>
//               <div className="flex items-center gap-3">
//                 <span className="text-xs text-muted-foreground flex items-center gap-1">
//                   <Clock className="h-3 w-3" />
//                   {formatTime(order.createdAt)}
//                 </span>
//                 <StatusBadge status={order.status} />
//               </div>
//             </div>
//           ))}
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// function TableOverviewCard({ tables, isLoading }: { tables: Table[]; isLoading: boolean }) {
//   if (isLoading) {
//     return (
//       <Card className="border-border bg-card">
//         <CardHeader>
//           <Skeleton className="h-5 w-32" />
//           <Skeleton className="h-4 w-48" />
//         </CardHeader>
//         <CardContent>
//           <div className="grid grid-cols-4 gap-2">
//             {[...Array(8)].map((_, i) => (
//               <Skeleton key={i} className="h-12 w-full" />
//             ))}
//           </div>
//         </CardContent>
//       </Card>
//     );
//   }

//   const getTableBg = (status: string) => {
//     switch (status) {
//       case "available":
//         return "bg-green-500/20 border-green-500/30 text-green-500";
//       case "occupied":
//         return "bg-destructive/20 border-destructive/30 text-destructive";
//       case "reserved":
//         return "bg-yellow-500/20 border-yellow-500/30 text-yellow-500";
//       default:
//         return "bg-muted text-muted-foreground";
//     }
//   };

//   return (
//     <Card className="border-border bg-card">
//       <CardHeader>
//         <CardTitle className="text-foreground">Table Overview</CardTitle>
//         <CardDescription>Current status of all tables</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
//           {tables.map((table) => (
//             <div
//               key={table.id}
//               className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-colors ${getTableBg(table.status)}`}
//             >
//               <span className="text-lg font-bold">{table.number}</span>
//               <span className="text-xs opacity-80">{table.capacity} seats</span>
//             </div>
//           ))}
//         </div>
//         <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border">
//           <div className="flex items-center gap-2">
//             <div className="h-3 w-3 rounded-full bg-green-500" />
//             <span className="text-xs text-muted-foreground">Available</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <div className="h-3 w-3 rounded-full bg-destructive" />
//             <span className="text-xs text-muted-foreground">Occupied</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <div className="h-3 w-3 rounded-full bg-yellow-500" />
//             <span className="text-xs text-muted-foreground">Reserved</span>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// function OrderStatusBreakdown({ stats, isLoading }: { stats: DashboardStats | null; isLoading: boolean }) {
//   if (isLoading || !stats) {
//     return (
//       <Card className="border-border bg-card">
//         <CardHeader>
//           <Skeleton className="h-5 w-40" />
//           <Skeleton className="h-4 w-48" />
//         </CardHeader>
//         <CardContent className="space-y-3">
//           {[1, 2, 3, 4].map((i) => (
//             <Skeleton key={i} className="h-8 w-full" />
//           ))}
//         </CardContent>
//       </Card>
//     );
//   }

//   const statusColors: Record<OrderStatus, string> = {
//     pending: "bg-yellow-500",
//     "in-preparation": "bg-blue-500",
//     served: "bg-primary",
//     completed: "bg-green-500",
//     cancelled: "bg-destructive",
//   };

//   const total = Object.values(stats.ordersByStatus).reduce((a, b) => a + b, 0);

//   return (
//     <Card className="border-border bg-card">
//       <CardHeader>
//         <CardTitle className="text-foreground">Order Status Breakdown</CardTitle>
//         <CardDescription>Distribution of orders by status today</CardDescription>
//       </CardHeader>
//       <CardContent className="space-y-3">
//         {(Object.entries(stats.ordersByStatus) as [OrderStatus, number][]).map(([status, count]) => {
//           const percentage = total > 0 ? (count / total) * 100 : 0;
//           return (
//             <div key={status} className="space-y-1">
//               <div className="flex items-center justify-between text-sm">
//                 <span className="text-foreground capitalize">
//                   {status.replace("-", " ")}
//                 </span>
//                 <span className="text-muted-foreground">{count}</span>
//               </div>
//               <div className="h-2 bg-secondary rounded-full overflow-hidden">
//                 <div
//                   className={`h-full ${statusColors[status as OrderStatus]} transition-all`}
//                   style={{ width: `${percentage}%` }}
//                 />
//               </div>
//             </div>
//           );
//         })}
//       </CardContent>
//     </Card>
//   );
// }

// export default function DashboardPage() {
//   const [isLoading, setIsLoading] = useState(true);
//   const [orders, setOrders] = useState<Order[]>([]);
//   const [tables, setTables] = useState<Table[]>([]);

//   useEffect(() => {
//     const unsubOrders = subscribeToTodaysOrders((data) => {
//       setOrders(data);
//       setIsLoading(false);
//     });
//     const unsubTables = subscribeToTables((data) => setTables(data));

//     return () => {
//       unsubOrders();
//       unsubTables();
//     };
//   }, []);

//   const stats: DashboardStats = useMemo(() => {
//     const activeTables = tables.filter(t => t.status !== "available").length;

//     // Filter orders for "today"
//     const today = new Date();
//     const todaysOrders = orders.filter(o => {
//       const d = new Date(o.createdAt);
//       return d.getDate() === today.getDate() &&
//         d.getMonth() === today.getMonth() &&
//         d.getFullYear() === today.getFullYear();
//     });

//     const activeOrders = todaysOrders.filter(o => o.status !== "completed" && o.status !== "cancelled").length;
//     const dailyRevenue = todaysOrders.reduce((acc, o) => acc + o.total, 0);

//     const ordersByStatus: Record<OrderStatus, number> = {
//       "pending": 0,
//       "in-preparation": 0,
//       "served": 0,
//       "completed": 0,
//       "cancelled": 0
//     };

//     todaysOrders.forEach(o => {
//       if (ordersByStatus[o.status] !== undefined) {
//         ordersByStatus[o.status]++;
//       }
//     });

//     return {
//       activeTables,
//       totalTables: tables.length,
//       activeOrders,
//       dailyRevenue,
//       ordersByStatus
//     };
//   }, [orders, tables]);

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
//         <p className="text-muted-foreground">
//           Welcome back! Here is an overview of your restaurant.
//         </p>
//       </div>

//       <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
//         <StatCard
//           title="Active Tables"
//           value={stats ? `${stats.activeTables}/${stats.totalTables}` : "0"}
//           subtitle="tables currently occupied"
//           icon={Grid3X3}
//           isLoading={isLoading}
//         />
//         <StatCard
//           title="Active Orders"
//           value={stats?.activeOrders || 0}
//           subtitle="orders in progress"
//           icon={ClipboardList}
//           isLoading={isLoading}
//         />
//         <StatCard
//           title="Daily Revenue"
//           value={stats ? `$${stats.dailyRevenue.toLocaleString()}` : "$0"}
//           subtitle="total sales today"
//           icon={DollarSign}
//           trend={{ value: 12.5, isPositive: true }}
//           isLoading={isLoading}
//         />
//         <StatCard
//           title="Avg. Order Value"
//           value={stats ? `$${(stats.dailyRevenue / (Math.max(stats.ordersByStatus.completed, 1))).toFixed(2)}` : "$0"}
//           subtitle="per completed order"
//           icon={TrendingUp}
//           isLoading={isLoading}
//         />
//       </div>

//       <div className="grid gap-6 lg:grid-cols-2">
//         <RecentOrdersCard orders={orders} isLoading={isLoading} />
//         <OrderStatusBreakdown stats={stats} isLoading={isLoading} />
//       </div>

//       <TableOverviewCard tables={tables} isLoading={isLoading} />
//     </div>
//   );
// }