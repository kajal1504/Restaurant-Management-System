"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Table, MenuItem, MenuCategory } from "@/lib/types";
import { Plus, Minus, Trash2, Search, ShoppingCart, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

interface CreateOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tables: Table[];
  menuItems: MenuItem[];
  categories: MenuCategory[];
  onCreateOrder: (tableId: string, items: CartItem[]) => void;
}

export function CreateOrderDialog({
  open,
  onOpenChange,
  tables,
  menuItems,
  categories,
  onCreateOrder,
}: CreateOrderDialogProps) {
  const [selectedTableId, setSelectedTableId] = useState<string>("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>(categories[0]?.id || "");
  const [editingNotes, setEditingNotes] = useState<string | null>(null);

  const visibleCategories = useMemo(
    () => categories.filter((c) => c.isVisible),
    [categories]
  );

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !activeCategory || item.categoryId === activeCategory;
      const isAvailable = item.isAvailable;
      return matchesSearch && matchesCategory && isAvailable;
    });
  }, [menuItems, searchQuery, activeCategory]);

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0),
    [cart]
  );

  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const addToCart = (menuItem: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.menuItem.id === menuItem.id);
      if (existing) {
        return prev.map((item) =>
          item.menuItem.id === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { menuItem, quantity: 1 }];
    });
  };

  const updateQuantity = (menuItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.menuItem.id === menuItemId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const updateNotes = (menuItemId: string, notes: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.menuItem.id === menuItemId ? { ...item, notes } : item
      )
    );
  };

  const removeFromCart = (menuItemId: string) => {
    setCart((prev) => prev.filter((item) => item.menuItem.id !== menuItemId));
  };

  const getCartQuantity = (menuItemId: string) => {
    return cart.find((item) => item.menuItem.id === menuItemId)?.quantity || 0;
  };

  const handleSubmit = () => {
    if (!selectedTableId || cart.length === 0) return;
    onCreateOrder(selectedTableId, cart);
    // Reset state
    setSelectedTableId("");
    setCart([]);
    setSearchQuery("");
    setActiveCategory(categories[0]?.id || "");
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state on close
    setSelectedTableId("");
    setCart([]);
    setSearchQuery("");
    setActiveCategory(categories[0]?.id || "");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New Order</DialogTitle>
          <DialogDescription>
            Select a table and add items to create a new order.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <div className="grid lg:grid-cols-3 gap-4 h-full">
            {/* Menu Section */}
            <div className="lg:col-span-2 flex flex-col">
              {/* Table Selection */}
              <div className="mb-4">
                <Label>Select Table</Label>
                <Select value={selectedTableId} onValueChange={setSelectedTableId}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choose a table" />
                  </SelectTrigger>
                  <SelectContent>
                    {tables.map((table) => (
                      <SelectItem key={table.id} value={table.id}>
                        Table {table.number} ({table.capacity} seats) -{" "}
                        {table.status === "available" ? "Available" : "Occupied"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search menu items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Categories */}
              <Tabs value={activeCategory} onValueChange={setActiveCategory} className="flex-1 flex flex-col">
                <TabsList className="w-full flex overflow-x-auto bg-secondary/50 border border-border">
                  {visibleCategories.map((category) => (
                    <TabsTrigger
                      key={category.id}
                      value={category.id}
                      className="flex-shrink-0 text-xs sm:text-sm"
                    >
                      {category.name}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <ScrollArea className="flex-1 mt-4 h-[300px]">
                  {visibleCategories.map((category) => (
                    <TabsContent key={category.id} value={category.id} className="m-0">
                      <div className="grid gap-2 sm:grid-cols-2">
                        {filteredItems
                          .filter((item) => item.categoryId === category.id)
                          .map((item) => {
                            const inCart = getCartQuantity(item.id);
                            return (
                              <div
                                key={item.id}
                                className={cn(
                                  "p-3 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer",
                                  inCart > 0 && "ring-1 ring-primary"
                                )}
                                onClick={() => addToCart(item)}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-foreground text-sm truncate">
                                      {item.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                      {item.description}
                                    </p>
                                  </div>
                                  <div className="flex flex-col items-end">
                                    <p className="font-medium text-primary text-sm">
                                      ${item.price.toFixed(2)}
                                    </p>
                                    {inCart > 0 && (
                                      <Badge className="mt-1 bg-primary text-primary-foreground text-xs">
                                        {inCart}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </TabsContent>
                  ))}
                </ScrollArea>
              </Tabs>
            </div>

            {/* Cart Section */}
            <div className="flex flex-col border-l border-border pl-4 h-full overflow-hidden">
              <div className="flex items-center gap-2 mb-4 shrink-0">
                <ShoppingCart className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Order Summary</h3>
                {cart.length > 0 && (
                  <Badge variant="secondary">{cart.length} items</Badge>
                )}
              </div>

              {cart.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-center text-muted-foreground text-sm">
                  <div>
                    <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Your cart is empty</p>
                    <p className="text-xs mt-1">Click items to add them</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1 w-full overflow-y-auto custom-scrollbar pr-2 pb-4">
                    <div className="space-y-3">
                      {cart.map((item) => (
                        <div
                          key={item.menuItem.id}
                          className="p-3 rounded-lg border border-border bg-secondary/30"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground text-sm truncate">
                                {item.menuItem.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                ${item.menuItem.price.toFixed(2)} each
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive hover:text-destructive"
                              onClick={() => removeFromCart(item.menuItem.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7 bg-transparent"
                                onClick={() => updateQuantity(item.menuItem.id, -1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="text-sm font-medium text-foreground w-6 text-center">
                                {item.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7 bg-transparent"
                                onClick={() => updateQuantity(item.menuItem.id, 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <p className="font-medium text-foreground text-sm">
                              ${(item.menuItem.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                          {editingNotes === item.menuItem.id ? (
                            <div className="mt-2">
                              <Textarea
                                placeholder="Special instructions..."
                                value={item.notes || ""}
                                onChange={(e) => updateNotes(item.menuItem.id, e.target.value)}
                                rows={2}
                                className="text-xs"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                className="mt-1 text-xs"
                                onClick={() => setEditingNotes(null)}
                              >
                                Done
                              </Button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              className="text-xs text-primary hover:underline mt-2"
                              onClick={() => setEditingNotes(item.menuItem.id)}
                            >
                              {item.notes ? `Note: ${item.notes}` : "+ Add note"}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-border space-y-2 shrink-0">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-foreground">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax (8%)</span>
                      <span className="text-foreground">${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                      <span className="text-foreground">Total</span>
                      <span className="text-primary flex items-center">
                        <DollarSign className="h-4 w-4" />
                        {total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button
            variant="destructive"
            onClick={handleClose}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedTableId || cart.length === 0}
          >
            Create Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
