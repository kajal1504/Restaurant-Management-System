"use client";

import { useState, useMemo, useEffect } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { CreateOrderDialog } from "@/components/orders/create-order-dialog";
import type { Order, OrderStatus, MenuItem, OrderItem, Table, MenuCategory } from "@/lib/types";

import { Plus, Search, Clock, DollarSign, ClipboardList, Filter, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  subscribeToOrders,
  subscribeToTables,
  subscribeToMenuItems,
  subscribeToCategories,
  createOrder,
  updateOrderStatus,
  deleteOrder
} from "@/lib/services";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);
  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null);

  //  State for stable time calculation
  const [now, setNow] = useState<number>(0);

  useEffect(() => {
    const unsubOrders = subscribeToOrders((data) => setOrders(data));
    const unsubTables = subscribeToTables((data) => setTables(data));
    const unsubMenu = subscribeToMenuItems((data) => setMenuItems(data));
    const unsubCats = subscribeToCategories((data) => setCategories(data));

    const timer = setTimeout(() => setNow(Date.now()), 0);
    const interval = setInterval(() => setNow(Date.now()), 60000); // Update every minute for relative time

    return () => {
      unsubOrders();
      unsubTables();
      unsubMenu();
      unsubCats();
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.table.number.toString().includes(searchQuery) ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  const formatTime = (date: Date) => {
    //  Use state 'now'
    if (now === 0) return "";
    const diff = Math.floor((now - new Date(date).getTime()) / 60000);
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff / 60)}h ${diff % 60}m ago`;
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success(`Order status updated to ${newStatus.replace("-", " ")}`);
      if (selectedOrder?.id === orderId) {
        // Optimistic update for standard UI flow (though firestore listener will likely catch up fast)
        setSelectedOrder((prev) =>
          prev ? { ...prev, status: newStatus, updatedAt: new Date() } : null
        );
      }
    } catch (e) {
      toast.error("Failed to update status");
    }
  };

  const handleCancelOrder = () => {
    if (!cancelOrderId) return;
    handleStatusChange(cancelOrderId, "cancelled");
    setCancelOrderId(null);
    toast.success("Order cancelled");
  };

  const handleDeleteOrder = async () => {
    if (!deleteOrderId) return;
    try {
      await deleteOrder(deleteOrderId);
      toast.success("Order deleted");
      setDeleteOrderId(null);
      setSelectedOrder(null);
    } catch (error) {
      toast.error("Failed to delete order");
    }
  };

  const handleCreateOrder = async (
    tableId: string,
    items: { menuItem: MenuItem; quantity: number; notes?: string }[]
  ) => {
    const table = tables.find((t) => t.id === tableId);
    if (!table) return;

    const orderItems: OrderItem[] = items.map((item, index) => ({
      id: `oi-new-${Date.now()}-${index}`,
      menuItemId: item.menuItem.id,
      menuItem: item.menuItem,
      quantity: item.quantity,
      notes: item.notes,
      price: item.menuItem.price,
    }));

    const subtotal = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    const newOrder: Order = {
      id: `o-${Date.now()}`,
      tableId,
      table,
      items: orderItems,
      status: "pending",
      subtotal,
      tax,
      total,
      createdAt: new Date(),
      updatedAt: new Date(),
      isPaid: false,
    };

    try {
      await createOrder(newOrder);
      setIsCreateDialogOpen(false);
      toast.success("Order created successfully");
    } catch (e) {
      toast.error("Failed to create order");
    }
  };

  const getNextStatus = (status: OrderStatus): OrderStatus | null => {
    switch (status) {
      case "pending":
        return "in-preparation";
      case "in-preparation":
        return "served";
      case "served":
        return "completed";
      default:
        return null;
    }
  };

  const statusOptions: { value: OrderStatus | "all"; label: string }[] = [
    { value: "all", label: "All Statuses" },
    { value: "pending", label: "Pending" },
    { value: "in-preparation", label: "In Preparation" },
    { value: "served", label: "Served" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

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
            <h1 className="text-2xl font-bold text-white drop-shadow-md text-shadow-strong">Orders</h1>
            <p className="text-white/80 drop-shadow-sm">
              Manage and track all restaurant orders.
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="shadow-lg shadow-primary/20">
            <Plus className="mr-2 h-4 w-4" />
            New Order
          </Button>
        </div>

        <Card className="border-white/10 bg-black/40 backdrop-blur-md shadow-xl">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                <Input
                  placeholder="Search by table number or order ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-black/20 border-white/10 text-white placeholder:text-white/40 focus-visible:ring-white/20"
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as OrderStatus | "all")}
              >
                <SelectTrigger className="w-full sm:w-48 bg-black/20 border-white/10 text-white focus:ring-white/20">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/10 text-white backdrop-blur-xl">
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="focus:bg-white/10 focus:text-white cursor-pointer">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {filteredOrders.length === 0 ? (
          <Card className="border-white/10 bg-black/40 backdrop-blur-md shadow-xl">
            <CardContent className="py-10">
              <EmptyState
                icon={ClipboardList}
                title={searchQuery || statusFilter !== "all" ? "No orders found" : "No orders yet"}
                description={
                  searchQuery || statusFilter !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "Create your first order to get started."
                }
                action={
                  !searchQuery && statusFilter === "all"
                    ? {
                      label: "Create Order",
                      onClick: () => setIsCreateDialogOpen(true),
                    }
                    : undefined
                }
                className="text-white/80"
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredOrders.map((order) => (
              <Card
                key={order.id}
                className={cn(
                  "cursor-pointer hover:shadow-2xl transition-all duration-300 border-white/10 bg-black/40 backdrop-blur-md hover:bg-black/50 group animate-in fade-in slide-in-from-bottom-2",
                  order.status === "cancelled" && "opacity-60 grayscale"
                )}
                onClick={() => setSelectedOrder(order)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10 text-white font-bold text-lg shadow-inner backdrop-blur-sm ring-1 ring-white/10">
                        T{order.table.number}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-white group-hover:text-primary transition-colors text-lg text-shadow-sm">
                            Table {order.table.number}
                          </p>
                          <StatusBadge status={order.status} className="shadow-sm" />
                        </div>
                        <p className="text-sm text-white/60">
                          {order.items.length} items &middot; Order #{order.id}
                        </p>
                        <p className="text-xs text-white/40 flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-white flex items-center justify-end drop-shadow-md">
                          <DollarSign className="h-4 w-4" />
                          {order.total.toFixed(2)}
                        </p>
                        {order.isPaid && (
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                            Paid
                          </Badge>
                        )}
                      </div>
                      {order.status !== "completed" && order.status !== "cancelled" && (
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          {getNextStatus(order.status) && (
                            <Button
                              size="sm"
                              onClick={() =>
                                handleStatusChange(order.id, getNextStatus(order.status)!)
                              }
                              className="bg-white/10 hover:bg-white/20 text-white border-white/10 shadow-sm"
                            >
                              Mark {getNextStatus(order.status)?.replace("-", " ")}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            className="bg-red-500 hover:bg-red-600 text-white shadow-md"
                            onClick={() => setCancelOrderId(order.id)}
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Order #{selectedOrder?.id}</span>
                {selectedOrder && <StatusBadge status={selectedOrder.status} />}
              </DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div>
                    <p className="font-medium text-foreground">
                      Table {selectedOrder.table.number}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedOrder.table.capacity} seats
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Created</p>
                    <p className="text-sm text-foreground">
                      {formatTime(selectedOrder.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="font-medium text-foreground">Items</p>
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between py-2 border-b border-border last:border-0"
                    >
                      <div className="flex-1">
                        <p className="text-foreground">
                          {item.quantity}x {item.menuItem.name}
                        </p>
                        {item.notes && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Note: {item.notes}
                          </p>
                        )}
                      </div>
                      <p className="text-foreground font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-border space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">${selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (8%)</span>
                    <span className="text-foreground">${selectedOrder.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                    <span className="text-foreground">Total</span>
                    <span className="text-primary">${selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>

                {selectedOrder.status !== "completed" &&
                  selectedOrder.status !== "cancelled" && (
                    <div className="flex gap-2 pt-4">
                      {getNextStatus(selectedOrder.status) && (
                        <Button
                          className="flex-1"
                          onClick={() =>
                            handleStatusChange(
                              selectedOrder.id,
                              getNextStatus(selectedOrder.status)!
                            )
                          }
                        >
                          Mark as {getNextStatus(selectedOrder.status)?.replace("-", " ")}
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        className="bg-red-500 hover:bg-red-600 text-white shadow-md"
                        onClick={() => {
                          setSelectedOrder(null);
                          setCancelOrderId(selectedOrder.id);
                        }}
                      >
                        Cancel Order
                      </Button>
                    </div>
                  )}

                {selectedOrder.status === "completed" && (
                  <div className="pt-4">
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => {
                        setSelectedOrder(null);
                        setDeleteOrderId(selectedOrder.id);
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Order
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!cancelOrderId} onOpenChange={() => setCancelOrderId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Order?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel this order? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep Order</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={handleCancelOrder}
              >
                Cancel Order
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={!!deleteOrderId} onOpenChange={() => setDeleteOrderId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Order?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this order? This action feels destructive and cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-red-500 hover:bg-red-600 text-white border-none">Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={handleDeleteOrder}
              >
                Delete Permanently
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <CreateOrderDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          tables={tables.filter((t) => t.status === "available" || t.status === "occupied")}
          menuItems={menuItems}
          categories={categories}
          onCreateOrder={handleCreateOrder}
        />
      </div>
    </div>
  );
}