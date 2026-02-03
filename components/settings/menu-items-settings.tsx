"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { EmptyState } from "@/components/ui/empty-state";
import { mockMenuItems, mockCategories } from "@/lib/mock-data";
import type { MenuItem, MenuCategory } from "@/lib/types";
import { Plus, Pencil, Trash2, DollarSign, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MenuItemFormData {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  isAvailable: boolean;
}

export function MenuItemsSettings() {
  const [items, setItems] = useState<MenuItem[]>(mockMenuItems);
  const [categories] = useState<MenuCategory[]>(mockCategories);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState<MenuItemFormData>({
    name: "",
    description: "",
    price: 0,
    categoryId: categories[0]?.id || "",
    isAvailable: true,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      categoryId: categories[0]?.id || "",
      isAvailable: true,
    });
    setEditingItem(null);
  };

  const handleOpenDialog = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description,
        price: item.price,
        categoryId: item.categoryId,
        isAvailable: item.isAvailable,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error("Item name is required");
      return;
    }
    if (formData.price <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }

    if (editingItem) {
      setItems((prev) =>
        prev.map((i) =>
          i.id === editingItem.id
            ? { ...i, ...formData }
            : i
        )
      );
      toast.success("Menu item updated successfully");
    } else {
      const newItem: MenuItem = {
        id: `m${Date.now()}`,
        ...formData,
      };
      setItems((prev) => [...prev, newItem]);
      toast.success("Menu item added successfully");
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    toast.success("Menu item deleted successfully");
  };

  const handleToggleAvailability = (itemId: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId ? { ...i, isAvailable: !i.isAvailable } : i
      )
    );
    toast.success("Availability updated");
  };

  const getItemsByCategory = (categoryId: string) =>
    items.filter((item) => item.categoryId === categoryId);

  if (items.length === 0) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="py-10">
          <EmptyState
            icon={UtensilsCrossed}
            title="No menu items yet"
            description="Add your first menu item to start building your menu."
            action={{
              label: "Add Item",
              onClick: () => handleOpenDialog(),
            }}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-foreground">Menu Items</CardTitle>
          <CardDescription>Manage your menu items grouped by category.</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Menu Item" : "Add New Menu Item"}</DialogTitle>
              <DialogDescription>
                {editingItem
                  ? "Update the menu item details below."
                  : "Enter the details for the new menu item."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="item-name">Item Name</Label>
                <Input
                  id="item-name"
                  placeholder="e.g., Grilled Salmon"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the dish..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  min={0}
                  step={0.01}
                  value={formData.price}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, price: parseFloat(e.target.value) || 0 }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, categoryId: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Available</Label>
                  <p className="text-xs text-muted-foreground">
                    Mark as available for ordering
                  </p>
                </div>
                <Switch
                  checked={formData.isAvailable}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, isAvailable: checked }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {editingItem ? "Save Changes" : "Add Item"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" defaultValue={categories.map((c) => c.id)} className="space-y-2">
          {categories
            .filter((c) => c.isVisible)
            .map((category) => {
              const categoryItems = getItemsByCategory(category.id);
              return (
                <AccordionItem
                  key={category.id}
                  value={category.id}
                  className="border border-border rounded-lg px-4"
                >
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-foreground">{category.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {categoryItems.length} items
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    {categoryItems.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4 text-center">
                        No items in this category yet.
                      </p>
                    ) : (
                      <div className="space-y-2 pb-2">
                        {categoryItems.map((item) => (
                          <div
                            key={item.id}
                            className={cn(
                              "flex items-center justify-between p-3 rounded-lg bg-secondary/30",
                              !item.isAvailable && "opacity-60"
                            )}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-foreground truncate">
                                  {item.name}
                                </p>
                                {!item.isAvailable && (
                                  <Badge variant="outline" className="text-xs bg-destructive/10 text-destructive border-destructive/30">
                                    Out of Stock
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground truncate mt-0.5">
                                {item.description}
                              </p>
                              <p className="text-sm font-medium text-primary mt-1 flex items-center">
                                <DollarSign className="h-3 w-3" />
                                {item.price.toFixed(2)}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 ml-4">
                              <Switch
                                checked={item.isAvailable}
                                onCheckedChange={() => handleToggleAvailability(item.id)}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenDialog(item)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete {item.name}?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently delete this menu item.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      onClick={() => handleDelete(item.id)}
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
        </Accordion>
      </CardContent>
    </Card>
  );
}
