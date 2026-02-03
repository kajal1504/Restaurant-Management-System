"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {  mockOrders  } from "@/lib/mock-data";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Users,
  Clock,
  Star,
  
} from "lucide-react";
import { cn } from "@/lib/utils";

// Generate mock analytics data
const generateAnalytics = () => {
  // Top selling items
  const itemSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
  mockOrders.forEach((order) => {
    order.items.forEach((item) => {
      if (!itemSales[item.menuItemId]) {
        itemSales[item.menuItemId] = {
          name: item.menuItem.name,
          quantity: 0,
          revenue: 0,
        };
      }
      itemSales[item.menuItemId].quantity += item.quantity;
      itemSales[item.menuItemId].revenue += item.price * item.quantity;
    });
  });

  const topSellingItems = Object.values(itemSales)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // Busiest tables
  const tableBusyness: Record<string, { number: number; orders: number; revenue: number }> = {};
  mockOrders.forEach((order) => {
    if (!tableBusyness[order.tableId]) {
      tableBusyness[order.tableId] = {
        number: order.table.number,
        orders: 0,
        revenue: 0,
      };
    }
    tableBusyness[order.tableId].orders += 1;
    tableBusyness[order.tableId].revenue += order.total;
  });

  const busiestTables = Object.values(tableBusyness)
    .sort((a, b) => b.orders - a.orders)
    .slice(0, 5);

  // Hourly distribution (mock)
  const hourlyData = [
    { hour: "11 AM", orders: 4, revenue: 180 },
    { hour: "12 PM", orders: 12, revenue: 540 },
    { hour: "1 PM", orders: 15, revenue: 720 },
    { hour: "2 PM", orders: 8, revenue: 360 },
    { hour: "5 PM", orders: 6, revenue: 280 },
    { hour: "6 PM", orders: 14, revenue: 680 },
    { hour: "7 PM", orders: 18, revenue: 920 },
    { hour: "8 PM", orders: 16, revenue: 780 },
    { hour: "9 PM", orders: 10, revenue: 460 },
  ];

  const peakHour = hourlyData.reduce((max, h) => (h.orders > max.orders ? h : max), hourlyData[0]);

  return {
    topSellingItems,
    busiestTables,
    hourlyData,
    peakHour,
    totalOrders: mockOrders.length + 12, // Add some "completed" orders
    avgOrderValue: 45.80,
    avgTableTurnover: 2.4,
    customerSatisfaction: 4.6,
  };
};

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("today");
  const analytics = generateAnalytics();

  const maxOrders = Math.max(...analytics.hourlyData.map((h) => h.orders));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">
            Insights and performance metrics for your restaurant.
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold text-foreground">{analytics.totalOrders}</p>
                <p className="text-xs text-success flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +12% from yesterday
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Order Value</p>
                <p className="text-2xl font-bold text-foreground">${analytics.avgOrderValue}</p>
                <p className="text-xs text-success flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +5% from yesterday
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Table Turnover</p>
                <p className="text-2xl font-bold text-foreground">{analytics.avgTableTurnover}x</p>
                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                  <TrendingDown className="h-3 w-3" />
                  -3% from yesterday
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Satisfaction</p>
                <p className="text-2xl font-bold text-foreground">{analytics.customerSatisfaction}/5</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  Based on 48 reviews
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Star className="h-5 w-5 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Selling Items */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Top Selling Items</CardTitle>
            <CardDescription>Most popular dishes by quantity sold</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topSellingItems.map((item, index) => (
                <div key={item.name} className="flex items-center gap-4">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full font-bold text-sm",
                      index === 0
                        ? "bg-warning/20 text-warning"
                        : index === 1
                        ? "bg-muted text-muted-foreground"
                        : index === 2
                        ? "bg-amber-600/20 text-amber-600"
                        : "bg-secondary text-secondary-foreground"
                    )}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} sold &middot; ${item.revenue.toFixed(2)} revenue
                    </p>
                  </div>
                  <Badge variant="secondary">{item.quantity}x</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Busiest Tables */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Busiest Tables</CardTitle>
            <CardDescription>Tables with most orders today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.busiestTables.map((table, index) => (
                <div key={table.number} className="flex items-center gap-4">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg font-bold",
                      index === 0
                        ? "bg-primary/20 text-primary"
                        : "bg-secondary text-secondary-foreground"
                    )}
                  >
                    T{table.number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">Table {table.number}</p>
                    <p className="text-sm text-muted-foreground">
                      {table.orders} orders &middot; ${table.revenue.toFixed(2)} revenue
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">{table.orders}</p>
                    <p className="text-xs text-muted-foreground">orders</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hourly Orders Chart */}
      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground">Orders by Hour</CardTitle>
              <CardDescription>
                Peak hour: {analytics.peakHour.hour} with {analytics.peakHour.orders} orders
              </CardDescription>
            </div>
            <Badge className="bg-primary/20 text-primary border-primary/30 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Peak: {analytics.peakHour.hour}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between gap-2 h-48">
            {analytics.hourlyData.map((hour) => {
              const heightPercent = (hour.orders / maxOrders) * 100;
              const isPeak = hour.hour === analytics.peakHour.hour;
              return (
                <div key={hour.hour} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col items-center">
                    <span className="text-xs text-muted-foreground mb-1">{hour.orders}</span>
                    <div
                      className={cn(
                        "w-full rounded-t transition-all",
                        isPeak ? "bg-primary" : "bg-primary/40"
                      )}
                      style={{ height: `${heightPercent}%`, minHeight: "8px" }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{hour.hour}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
