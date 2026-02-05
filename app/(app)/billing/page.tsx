"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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

import { EmptyState } from "@/components/ui/empty-state";
import type { Order } from "@/lib/types";
import {
  Search,
  CreditCard,
  DollarSign,
  Printer,
  CheckCircle2,
  Clock,
  Filter,
  UtensilsCrossed,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { subscribeToOrders, markOrderAsPaid } from "@/lib/services";
import { toast } from "sonner";

export default function BillingPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [paidFilter, setPaidFilter] = useState<"all" | "paid" | "unpaid">("unpaid");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = subscribeToOrders((data) => setOrders(data));
    return () => unsub();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Only show completed or served orders for billing
      if (!["served", "completed"].includes(order.status)) return false;

      const matchesSearch =
        order.table.number.toString().includes(searchQuery) ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPaidFilter =
        paidFilter === "all" ||
        (paidFilter === "paid" && order.isPaid) ||
        (paidFilter === "unpaid" && !order.isPaid);

      return matchesSearch && matchesPaidFilter;
    });
  }, [orders, searchQuery, paidFilter]);

  const totals = useMemo(() => {
    const unpaidOrders = orders.filter(
      (o) => !o.isPaid && ["served", "completed"].includes(o.status)
    );
    const paidOrders = orders.filter(
      (o) => o.isPaid && ["served", "completed"].includes(o.status)
    );
    return {
      unpaidCount: unpaidOrders.length,
      unpaidAmount: unpaidOrders.reduce((sum, o) => sum + o.total, 0),
      paidCount: paidOrders.length,
      paidAmount: paidOrders.reduce((sum, o) => sum + o.total, 0),
    };
  }, [orders]);

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  const handleMarkAsPaid = async () => {
    if (!selectedOrder) return;

    setIsProcessingPayment(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      await markOrderAsPaid(selectedOrder.id);
      // Local update will happen via subscription, but for immediate feedback:
      setOrders((prev) =>
        prev.map((o) =>
          o.id === selectedOrder.id ? { ...o, isPaid: true, status: "completed" } : o
        )
      );
    } catch (e) {
      console.error(e);
      toast.error("Failed to mark as paid");
      setIsProcessingPayment(false);
      return;
    }

    setIsProcessingPayment(false);
    setSelectedOrder(null);
    setShowSuccessDialog(true);

    setTimeout(() => setShowSuccessDialog(false), 2000);
  };

  const handlePrint = () => {
    if (!invoiceRef.current) return;

    const printContent = invoiceRef.current.innerHTML;
    const printWindow = window.open("", "", "width=400,height=600");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice - Order #${selectedOrder?.id}</title>
            <style>
              body { font-family: 'Courier New', monospace; padding: 20px; max-width: 300px; margin: 0 auto; }
              .header { text-align: center; margin-bottom: 20px; }
              .divider { border-top: 1px dashed #000; margin: 10px 0; }
              .line-item { display: flex; justify-content: space-between; margin: 5px 0; }
              .total { font-weight: bold; font-size: 1.2em; }
              .footer { text-align: center; margin-top: 20px; font-size: 0.9em; }
            </style>
          </head>
          <body>
            ${printContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
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
            <h1 className="text-2xl font-bold text-white drop-shadow-md text-shadow-strong">Billing & Payments</h1>
            <p className="text-white/80 drop-shadow-sm">
              Process payments and manage invoices.
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          <Card className="border-l-4 border-l-yellow-500 shadow-xl bg-black/40 backdrop-blur-md border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">Pending Payments</p>
                  <p className="text-2xl font-bold text-yellow-400 drop-shadow-md">
                    ${totals.unpaidAmount.toFixed(2)}
                  </p>
                  <p className="text-xs text-white/50 mt-1">
                    {totals.unpaidCount} orders awaiting payment
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-yellow-500/20 flex items-center justify-center border border-yellow-500/30">
                  <Clock className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500 shadow-xl bg-black/40 backdrop-blur-md border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">Collected Today</p>
                  <p className="text-2xl font-bold text-green-400 drop-shadow-md">
                    ${totals.paidAmount.toFixed(2)}
                  </p>
                  <p className="text-xs text-white/50 mt-1">
                    {totals.paidCount} orders paid
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
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
                value={paidFilter}
                onValueChange={(v) => setPaidFilter(v as "all" | "paid" | "unpaid")}
              >
                <SelectTrigger className="w-full sm:w-40 bg-black/20 border-white/10 text-white focus:ring-white/20">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/10 text-white backdrop-blur-xl">
                  <SelectItem value="all" className="focus:bg-white/10 focus:text-white cursor-pointer">All</SelectItem>
                  <SelectItem value="unpaid" className="focus:bg-white/10 focus:text-white cursor-pointer">Unpaid</SelectItem>
                  <SelectItem value="paid" className="focus:bg-white/10 focus:text-white cursor-pointer">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <Card className="border-white/10 bg-black/40 backdrop-blur-md shadow-xl">
            <CardContent className="py-10">
              <EmptyState
                icon={CreditCard}
                title={searchQuery || paidFilter !== "all" ? "No orders found" : "No billable orders"}
                description={
                  searchQuery || paidFilter !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "Orders will appear here when they are ready for billing."
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
                  !order.isPaid && "border-l-4 border-l-yellow-500"
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
                          {order.isPaid ? (
                            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Paid
                            </Badge>
                          ) : (
                            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                              <Clock className="mr-1 h-3 w-3" />
                              Unpaid
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-white/60">
                          {order.items.length} items &middot; Order #{order.id} &middot; {formatTime(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-white flex items-center justify-end drop-shadow-md">
                          <DollarSign className="h-5 w-5" />
                          {order.total.toFixed(2)}
                        </p>
                      </div>
                      {!order.isPaid && (
                        <Button onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(order);
                        }} className="shadow-lg shadow-primary/20">
                          <CreditCard className="mr-2 h-4 w-4" />
                          Pay
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Billing Detail Dialog */}
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Invoice - Order #{selectedOrder?.id}</span>
                {selectedOrder?.isPaid && (
                  <Badge className="bg-success/20 text-success border-success/30">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Paid
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription>
                Table {selectedOrder?.table.number} - {selectedOrder?.items.length} items
              </DialogDescription>
            </DialogHeader>

            {selectedOrder && (
              <div className="space-y-4">
                {/* Print-friendly invoice */}
                <div ref={invoiceRef} className="p-4 rounded-lg bg-secondary/30 border border-border">
                  <div className="text-center mb-4">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <UtensilsCrossed className="h-5 w-5 text-primary" />
                      <span className="font-bold text-lg text-foreground">TableFlow</span>
                    </div>
                    <p className="text-xs text-muted-foreground">123 Restaurant Street</p>
                    <p className="text-xs text-muted-foreground">Tel: (555) 123-4567</p>
                  </div>

                  <Separator className="my-3" />

                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Order #</span>
                    <span className="text-foreground">{selectedOrder.id}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Table</span>
                    <span className="text-foreground">{selectedOrder.table.number}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Date</span>
                    <span className="text-foreground">
                      {new Intl.DateTimeFormat("en-US", {
                        dateStyle: "short",
                        timeStyle: "short",
                      }).format(selectedOrder.createdAt)}
                    </span>
                  </div>

                  <Separator className="my-3" />

                  <div className="space-y-2">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <div className="flex-1">
                          <span className="text-foreground">{item.quantity}x </span>
                          <span className="text-foreground">{item.menuItem.name}</span>
                          {item.notes && (
                            <p className="text-xs text-muted-foreground pl-4">
                              ({item.notes})
                            </p>
                          )}
                        </div>
                        <span className="text-foreground font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-3" />

                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-foreground">${selectedOrder.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax (8%)</span>
                      <span className="text-foreground">${selectedOrder.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2">
                      <span className="text-foreground">Total</span>
                      <span className="text-primary">${selectedOrder.total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="text-center mt-4 pt-4 border-t border-dashed border-border">
                    <p className="text-xs text-muted-foreground">Thank you for dining with us!</p>
                  </div>
                </div>

                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={handlePrint}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                  </Button>
                  {!selectedOrder.isPaid && (
                    <Button onClick={handleMarkAsPaid} disabled={isProcessingPayment}>
                      {isProcessingPayment ? (
                        <>
                          <span className="animate-spin mr-2">
                            <DollarSign className="h-4 w-4" />
                          </span>
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="mr-2 h-4 w-4" />
                          Mark as Paid
                        </>
                      )}
                    </Button>
                  )}
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Success Dialog */}
        <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <DialogContent className="sm:max-w-sm text-center">
            <div className="flex flex-col items-center py-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/20 mb-4">
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Payment Successful!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                The order has been marked as paid.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
