"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/status-badge";
import { mockTables, mockOrders } from "@/lib/mock-data";
import type { Table, TableStatus, Order } from "@/lib/types";
import { Users, Clock, DollarSign, ArrowRight, RefreshCw, Grid3X3 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>(mockTables);
  const [orders] = useState<Order[]>(mockOrders);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [now, setNow] = useState<number>(0);

  useEffect(() => {
    const timer = setTimeout(() => setNow(Date.now()), 0);
    return () => clearTimeout(timer);
  }, []);

  const getTableOrder = (tableId: string) =>
    orders.find(
      (o) => o.tableId === tableId && !["completed", "cancelled"].includes(o.status)
    );

  const handleStatusChange = (tableId: string, newStatus: TableStatus) => {
    setTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, status: newStatus } : t))
    );
    toast.success(`Table status updated to ${newStatus}`);
    if (selectedTable?.id === tableId) {
      setSelectedTable((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const simulateAutoUpdate = () => {
    setIsUpdating(true);
    setTimeout(() => {
      setIsUpdating(false);
      toast.success("Table statuses refreshed");
    }, 1000);
  };

  const formatTime = (date: Date) => {
    if (now === 0) return "";
    const diff = Math.floor((now - date.getTime()) / 60000);
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff / 60)}h ${diff % 60}m`;
  };

  // FIXED: Explicit Colors (Green, Red, Yellow)
  const getStatusColor = (status: TableStatus) => {
    switch (status) {
      case "available":
        return "border-green-500/50 bg-green-500/20 hover:bg-green-500/30"; // Green
      case "occupied":
        return "border-red-500/50 bg-red-500/20 hover:bg-red-500/30"; // Red
      case "reserved":
        return "border-yellow-500/50 bg-yellow-500/20 hover:bg-yellow-500/30"; // Yellow
    }
  };

  // FIXED: Explicit Text Colors
  const getStatusTextColor = (status: TableStatus) => {
    switch (status) {
      case "available":
        return "text-green-500";
      case "occupied":
        return "text-red-500";
      case "reserved":
        return "text-yellow-500";
    }
  };

  const tableCounts = {
    available: tables.filter((t) => t.status === "available").length,
    occupied: tables.filter((t) => t.status === "occupied").length,
    reserved: tables.filter((t) => t.status === "reserved").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Table Management</h1>
          <p className="text-muted-foreground">
            Real-time overview of all tables in your restaurant.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "list")}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="grid">Grid View</SelectItem>
              <SelectItem value="list">List View</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={simulateAutoUpdate} disabled={isUpdating}>
            <RefreshCw className={cn("mr-2 h-4 w-4", isUpdating && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid gap-4 grid-cols-3">
        {/* FIXED: Green Card */}
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-bold text-green-500">{tableCounts.available}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <Grid3X3 className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* FIXED: Red Card */}
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Occupied</p>
                <p className="text-2xl font-bold text-red-500">{tableCounts.occupied}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <Users className="h-5 w-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* FIXED: Yellow Card */}
        <Card className="border-yellow-500/30 bg-yellow-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Reserved</p>
                <p className="text-2xl font-bold text-yellow-500">{tableCounts.reserved}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables Grid/List */}
      {viewMode === "grid" ? (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Floor Plan</CardTitle>
            <CardDescription>Click on a table to view details or change status.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {tables.map((table) => {
                const activeOrder = getTableOrder(table.id);
                return (
                  <button
                    key={table.id}
                    type="button"
                    onClick={() => setSelectedTable(table)}
                    className={cn(
                      "relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all aspect-square",
                      getStatusColor(table.status)
                    )}
                  >
                    <span className={cn("text-3xl font-bold", getStatusTextColor(table.status))}>
                      {table.number}
                    </span>
                    <span className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {table.capacity}
                    </span>
                    {activeOrder && (
                      <div className="absolute -top-2 -right-2">
                        <Badge className="bg-blue-500 text-white text-xs animate-pulse">
                          Active
                        </Badge>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded border-2 border-green-500/50 bg-green-500/20" />
                <span className="text-sm text-muted-foreground">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded border-2 border-red-500/50 bg-red-500/20" />
                <span className="text-sm text-muted-foreground">Occupied</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded border-2 border-yellow-500/50 bg-yellow-500/20" />
                <span className="text-sm text-muted-foreground">Reserved</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">All Tables</CardTitle>
            <CardDescription>List view of all tables with quick actions.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {tables.map((table) => {
                const activeOrder = getTableOrder(table.id);
                return (
                  <div
                    key={table.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-lg font-bold text-lg",
                          getStatusColor(table.status),
                          getStatusTextColor(table.status)
                        )}
                      >
                        {table.number}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">Table {table.number}</p>
                          <StatusBadge status={table.status} />
                          {activeOrder && (
                            <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30">
                              Order #{activeOrder.id}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {table.capacity} seats
                          {activeOrder && (
                            <span className="ml-2">
                              &middot; ${activeOrder.total.toFixed(2)} &middot;{" "}
                              {formatTime(activeOrder.createdAt)}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" onClick={() => setSelectedTable(table)}>
                      View Details
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table Detail Dialog */}
      <Dialog open={!!selectedTable} onOpenChange={() => setSelectedTable(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-lg font-bold text-xl",
                  selectedTable && getStatusColor(selectedTable.status),
                  selectedTable && getStatusTextColor(selectedTable.status)
                )}
              >
                {selectedTable?.number}
              </div>
              <div>
                <span className="text-foreground">Table {selectedTable?.number}</span>
                <div className="mt-1">
                  <StatusBadge status={selectedTable?.status || "available"} />
                </div>
              </div>
            </DialogTitle>
            <DialogDescription>
              Manage table status and view active order details.
            </DialogDescription>
          </DialogHeader>

          {selectedTable && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                <span className="text-muted-foreground">Capacity</span>
                <span className="text-foreground font-medium flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {selectedTable.capacity} seats
                </span>
              </div>

              {/* Active Order Info */}
              {(() => {
                const activeOrder = getTableOrder(selectedTable.id);
                if (activeOrder) {
                  return (
                    <div className="p-4 rounded-lg border border-blue-500/30 bg-blue-500/5">
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-medium text-foreground">Active Order</p>
                        <StatusBadge status={activeOrder.status} />
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Order ID</span>
                          <span className="text-foreground">#{activeOrder.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Items</span>
                          <span className="text-foreground">{activeOrder.items.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Duration</span>
                          <span className="text-foreground">{formatTime(activeOrder.createdAt)}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-border">
                          <span className="text-foreground font-medium">Total</span>
                          <span className="text-primary font-bold flex items-center">
                            <DollarSign className="h-4 w-4" />
                            {activeOrder.total.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Status Change - FIXED Buttons to match colors */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Change Status</p>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={selectedTable.status === "available" ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      selectedTable.status === "available" && "bg-green-600 hover:bg-green-700"
                    )}
                    onClick={() => handleStatusChange(selectedTable.id, "available")}
                  >
                    Available
                  </Button>
                  <Button
                    variant={selectedTable.status === "occupied" ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      selectedTable.status === "occupied" && "bg-red-600 hover:bg-red-700"
                    )}
                    onClick={() => handleStatusChange(selectedTable.id, "occupied")}
                  >
                    Occupied
                  </Button>
                  <Button
                    variant={selectedTable.status === "reserved" ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      selectedTable.status === "reserved" && "bg-yellow-600 hover:bg-yellow-700"
                    )}
                    onClick={() => handleStatusChange(selectedTable.id, "reserved")}
                  >
                    Reserved
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}