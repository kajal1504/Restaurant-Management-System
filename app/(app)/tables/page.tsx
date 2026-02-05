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
import { mockOrders } from "@/lib/mock-data";
import type { Table, TableStatus, Order } from "@/lib/types";
import { Users, Clock, DollarSign, ArrowRight, RefreshCw, Grid3X3, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  subscribeToTables,
  updateTableStatus,
  addTable,
  deleteTable
} from "@/lib/services";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [orders] = useState<Order[]>(mockOrders); // Still using mock orders for simple display logic if needed
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [now, setNow] = useState<number>(0);

  // Add Table State
  const [isAddTableOpen, setIsAddTableOpen] = useState(false);
  const [newTableNumber, setNewTableNumber] = useState("");
  const [newTableCapacity, setNewTableCapacity] = useState("");
  const [newTableStatus, setNewTableStatus] = useState<TableStatus>("available");

  useEffect(() => {
    const unsub = subscribeToTables((data) => {
      setTables(data);
    });

    // Timer for "Just now" format
    const timer = setTimeout(() => setNow(Date.now()), 0);

    return () => {
      unsub();
      clearTimeout(timer);
    };
  }, []);

  const getTableOrder = (tableId: string) =>
    orders.find(
      (o) => o.tableId === tableId && !["completed", "cancelled"].includes(o.status)
    );

  const handleStatusChange = async (tableId: string, newStatus: TableStatus) => {
    try {
      await updateTableStatus(tableId, newStatus);
      toast.success(`Table status updated to ${newStatus}`);

      // Update local selected state to match immediate UI
      if (selectedTable?.id === tableId) {
        setSelectedTable((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const simulateAutoUpdate = () => {
    setIsUpdating(true);
    // In real app, this might force a fetch or just be visual
    setTimeout(() => {
      setIsUpdating(false);
      toast.success("Table statuses refreshed");
    }, 1000);
  };

  const handleDeleteTable = async (e: React.MouseEvent, tableId: string, tableNumber: number) => {
    e.stopPropagation(); // Prevent opening the dialog
    if (confirm(`Are you sure you want to delete Table ${tableNumber}?`)) {
      try {
        await deleteTable(tableId);
        toast.success(`Table ${tableNumber} deleted`);
        if (selectedTable?.id === tableId) setSelectedTable(null);
      } catch (error) {
        console.error(error);
        toast.error("Failed to delete table");
      }
    }
  };

  const handleAddTable = async () => {
    if (!newTableNumber || !newTableCapacity) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setIsUpdating(true);
      await addTable({
        number: parseInt(newTableNumber),
        capacity: parseInt(newTableCapacity),
        status: newTableStatus,
      });
      toast.success(`Table ${newTableNumber} created successfully`);
      setIsAddTableOpen(false);
      setNewTableNumber("");
      setNewTableCapacity("");
      setNewTableStatus("available");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create table");
    } finally {
      setIsUpdating(false);
    }
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
      case "available":
        return "border-green-500/30 bg-green-500/10 hover:bg-green-500/20"; // Green
      case "occupied":
        return "border-red-500/30 bg-red-500/10 hover:bg-red-500/20"; // Red
      case "reserved":
        return "border-yellow-500/30 bg-yellow-500/10 hover:bg-yellow-500/20"; // Yellow
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
            <h1 className="text-2xl font-bold text-white drop-shadow-md text-shadow-strong">Table Management</h1>
            <p className="text-white/80 drop-shadow-sm">
              Real-time overview of all tables in your restaurant.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setIsAddTableOpen(true)} className="shadow-lg shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" /> Add Table
            </Button>
            <Select value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "list")}>
              <SelectTrigger className="w-28 bg-black/20 border-white/20 text-white focus:ring-offset-0 focus:ring-white/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black/90 border-white/10 text-white backdrop-blur-xl">
                <SelectItem value="grid" className="focus:bg-white/10 focus:text-white cursor-pointer">Grid View</SelectItem>
                <SelectItem value="list" className="focus:bg-white/10 focus:text-white cursor-pointer">List View</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={simulateAutoUpdate} disabled={isUpdating}
              className="text-white border-white/20 hover:bg-white/10 hover:text-white bg-black/20"
            >
              <RefreshCw className={cn("mr-2 h-4 w-4", isUpdating && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </div>


        <div className="grid gap-4 grid-cols-3">

          <Card className="border-l-4 border-l-green-500 shadow-xl bg-black/40 backdrop-blur-md border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">Available</p>
                  <p className="text-2xl font-bold text-green-400 drop-shadow-md">{tableCounts.available}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Grid3X3 className="h-5 w-5 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FIXED: Red Card */}
          <Card className="border-l-4 border-l-red-500 shadow-xl bg-black/40 backdrop-blur-md border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">Occupied</p>
                  <p className="text-2xl font-bold text-red-400 drop-shadow-md">{tableCounts.occupied}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center">
                  <Users className="h-5 w-5 text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FIXED: Yellow Card */}
          <Card className="border-l-4 border-l-yellow-500 shadow-xl bg-black/40 backdrop-blur-md border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">Reserved</p>
                  <p className="text-2xl font-bold text-yellow-400 drop-shadow-md">{tableCounts.reserved}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tables Grid/List */}
        {viewMode === "grid" ? (
          <Card className="border-white/10 bg-black/40 backdrop-blur-md shadow-xl">
            <CardHeader>
              <CardTitle className="text-white drop-shadow-md">Floor Plan</CardTitle>
              <CardDescription className="text-white/70">Click on a table to view details or change status.</CardDescription>
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
                        "relative flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-300 hover:scale-105 hover:shadow-xl aspect-square bg-card/10 backdrop-blur-sm",
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

                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity z-20"
                        onClick={(e) => handleDeleteTable(e, table.id, table.number)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>

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
              <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded border-2 border-green-500/50 bg-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.3)]" />
                  <span className="text-sm text-white/70">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded border-2 border-red-500/50 bg-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.3)]" />
                  <span className="text-sm text-white/70">Occupied</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded border-2 border-yellow-500/50 bg-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.3)]" />
                  <span className="text-sm text-white/70">Reserved</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-white/10 bg-black/40 backdrop-blur-md shadow-xl">
            <CardHeader>
              <CardTitle className="text-white drop-shadow-md">All Tables</CardTitle>
              <CardDescription className="text-white/70">List view of all tables with quick actions.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {tables.map((table) => {
                  const activeOrder = getTableOrder(table.id);
                  return (
                    <div
                      key={table.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-white/5 bg-card/10 hover:bg-white/5 transition-colors backdrop-blur-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            "flex h-12 w-12 items-center justify-center rounded-lg font-bold text-lg text-shadow-sm shadow-md",
                            getStatusColor(table.status),
                            getStatusTextColor(table.status)
                          )}
                        >
                          {table.number}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-white">Table {table.number}</p>
                            <StatusBadge status={table.status} />
                            {activeOrder && (
                              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                                Order #{activeOrder.id}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-white/50">
                            {table.capacity} seats
                            {activeOrder && (
                              <span className="ml-2 text-white/70">
                                &middot; ${activeOrder.total.toFixed(2)} &middot;{" "}
                                {formatTime(activeOrder.createdAt)}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" onClick={() => setSelectedTable(table)} className="text-white/80 hover:text-white hover:bg-white/10">
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        className="ml-2 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                        size="icon"
                        onClick={(e) => handleDeleteTable(e, table.id, table.number)}
                      >
                        <Trash2 className="h-4 w-4" />
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
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant={selectedTable.status === "available" ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "text-black",
                        selectedTable.status === "available"
                          ? "bg-green-500 hover:bg-green-600"
                          : "bg-white/10 hover:bg-white/20 text-white border-white/20"
                      )}
                      onClick={() => handleStatusChange(selectedTable.id, "available")}
                    >
                      Available
                    </Button>
                    <Button
                      variant={selectedTable.status === "occupied" ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "text-black",
                        selectedTable.status === "occupied"
                          ? "bg-red-500 hover:bg-red-600"
                          : "bg-white/10 hover:bg-white/20 text-white border-white/20"
                      )}
                      onClick={() => handleStatusChange(selectedTable.id, "occupied")}
                    >
                      Occupied
                    </Button>
                    <Button
                      variant={selectedTable.status === "reserved" ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "text-black",
                        selectedTable.status === "reserved"
                          ? "bg-yellow-500 hover:bg-yellow-600"
                          : "bg-white/10 hover:bg-white/20 text-white border-white/20"
                      )}
                      onClick={() => handleStatusChange(selectedTable.id, "reserved")}
                    >
                      Reserved
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-black font-semibold"
                      onClick={(e) => handleDeleteTable(e, selectedTable.id, selectedTable.number)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Table Dialog */}
        <Dialog open={isAddTableOpen} onOpenChange={setIsAddTableOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Table</DialogTitle>
              <DialogDescription>
                Create a new table in the restaurant.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="number" className="text-right">
                  Table No.
                </Label>
                <Input
                  id="number"
                  type="number"
                  value={newTableNumber}
                  onChange={(e) => setNewTableNumber(e.target.value)}
                  className="col-span-3 text-black bg-white placeholder:text-gray-400"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="capacity" className="text-right">
                  Seats
                </Label>
                <Input
                  id="capacity"
                  type="number"
                  value={newTableCapacity}
                  onChange={(e) => setNewTableCapacity(e.target.value)}
                  className="col-span-3 text-black bg-white placeholder:text-gray-400"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select value={newTableStatus} onValueChange={(v) => setNewTableStatus(v as TableStatus)}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="reserved">Reserved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="destructive"
                onClick={() => setIsAddTableOpen(false)}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Cancel
              </Button>
              <Button onClick={handleAddTable} disabled={isUpdating}>
                {isUpdating ? "Creating..." : "Create Table"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}