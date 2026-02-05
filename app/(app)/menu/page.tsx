"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button"; // Added Button
import type { MenuItem, MenuCategory } from "@/lib/types";
import { Search, DollarSign, UtensilsCrossed, Database } from "lucide-react"; // Database icon
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  subscribeToMenuItems,
  subscribeToCategories,
  toggleMenuItemAvailability,
  seedDatabase,
  addMenuItem
} from "@/lib/services";
import { Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  // Add Item State
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemDescription, setNewItemDescription] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Realtime subscriptions
  useEffect(() => {
    const unsubItems = subscribeToMenuItems((data) => {
      setItems(data);
      setLoading(false);
    });

    const unsubCategories = subscribeToCategories((data) => {
      setCategories(data);
    });

    return () => {
      unsubItems();
      unsubCategories();
    };
  }, []);

  const visibleCategories = useMemo(
    () => categories.filter((c) => c.isVisible),
    [categories]
  );

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        activeCategory === "all" || item.categoryId === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [items, searchQuery, activeCategory]);

  const handleToggleAvailability = async (itemId: string, currentStatus: boolean, itemName: string) => {
    try {
      await toggleMenuItemAvailability(itemId, currentStatus);
      toast.success(
        currentStatus ? `${itemName} marked as out of stock` : `${itemName} now available`
      );
    } catch (error) {
      toast.error("Failed to update status");
      console.error(error);
    }
  };

  const handleSeed = async () => {
    try {
      await seedDatabase();
      toast.success("Database seeded with mock data!");
    } catch (e) {
      toast.error("Seeding failed check console");
      console.error(e);
    }
  }

  const handleAddItem = async () => {
    if (!newItemName || !newItemPrice || !newItemCategory) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsAdding(true);
      await addMenuItem({
        name: newItemName,
        description: newItemDescription,
        price: parseFloat(newItemPrice),
        categoryId: newItemCategory,
        isAvailable: true,
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80", // Default tasty food image
      });
      toast.success(`${newItemName} added to menu`);
      setIsAddItemOpen(false);
      // Reset form
      setNewItemName("");
      setNewItemDescription("");
      setNewItemPrice("");
      setNewItemCategory("");
    } catch (e) {
      console.error(e);
      toast.error("Failed to add menu item");
    } finally {
      setIsAdding(false);
    }
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || "Unknown";
  };

  if (loading && items.length === 0) {
    return <div className="p-10 text-center">Loading Menu...</div>
  }

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white drop-shadow-md text-shadow-strong">Menu</h1>
            <p className="text-white/80 drop-shadow-sm">
              View and manage menu item availability.
            </p>
          </div>
          {/* Temporary Seed Button for Setup */}
          {items.length === 0 && (
            <Button variant="outline" onClick={handleSeed} className="text-white hover:bg-white/10 hover:text-white border-white/20">
              <Database className="mr-2 h-4 w-4" />
              Seed Data
            </Button>
          )}
          <Button onClick={() => setIsAddItemOpen(true)} className="shadow-lg shadow-primary/20">
            <Plus className="mr-2 h-4 w-4" /> Add Item
          </Button>
        </div>

        {/* Search */}
        <Card className="border-white/10 bg-black/40 backdrop-blur-md shadow-xl">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
              <Input
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-black/20 border-white/10 text-white placeholder:text-white/40 focus-visible:ring-white/20"
              />
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-black/40 border border-white/10 p-1 backdrop-blur-md">
            <TabsTrigger value="all" className="flex-shrink-0 data-[state=active]:bg-primary data-[state=active]:text-white text-white/70 hover:text-white hover:bg-white/10">
              All Items
            </TabsTrigger>
            {visibleCategories.map((category) => (
              <TabsTrigger key={category.id} value={category.id} className="flex-shrink-0 data-[state=active]:bg-primary data-[state=active]:text-white text-white/70 hover:text-white hover:bg-white/10">
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeCategory} className="mt-6">
            {activeCategory === "all" ? (
              // All items view - grouped by category
              <div className="space-y-6">
                {visibleCategories.map((category) => {
                  const categoryItems = filteredItems.filter(
                    (item) => item.categoryId === category.id
                  );
                  if (categoryItems.length === 0) return null;
                  return (
                    <Card key={category.id} className="border-white/10 bg-black/20 backdrop-blur-sm shadow-none">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2 drop-shadow-sm">
                          {category.name}
                          <Badge variant="secondary" className="bg-white/10 text-white hover:bg-white/20">{categoryItems.length}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {categoryItems.map((item, index) => (
                            <MenuItemCard
                              key={item.id}
                              item={item}
                              onToggleAvailability={handleToggleAvailability}
                              index={index}
                            />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              // Single category view
              <Card className="border-white/10 bg-black/20 backdrop-blur-sm shadow-none">
                <CardHeader>
                  <CardTitle className="text-white drop-shadow-md">
                    {getCategoryName(activeCategory)}
                  </CardTitle>
                  <CardDescription className="text-white/70">
                    {filteredItems.length} items in this category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredItems.map((item, index) => (
                      <MenuItemCard
                        key={item.id}
                        item={item}
                        onToggleAvailability={handleToggleAvailability}
                        index={index}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {filteredItems.length === 0 && !loading && (
          <Card className="border-border bg-card">
            <CardContent className="py-10 text-center">
              <UtensilsCrossed className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
              <p className="text-foreground font-medium">No items found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filter.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Add Item Dialog */}
        <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Menu Item</DialogTitle>
              <DialogDescription>
                Create a new item for your menu.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="bg-black/20 text-white border-white/10 placeholder:text-white/50 focus-visible:ring-white/20"
                  placeholder="Item name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={newItemDescription}
                  onChange={(e) => setNewItemDescription(e.target.value)}
                  className="bg-black/20 text-white border-white/10 placeholder:text-white/50 focus-visible:ring-white/20"
                  placeholder="Description"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(e.target.value)}
                  className="bg-black/20 text-white border-white/10 placeholder:text-white/50 focus-visible:ring-white/20"
                  placeholder="0.00"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select value={newItemCategory} onValueChange={setNewItemCategory}>
                  <SelectTrigger className="bg-black/20 text-white border-white/10 focus:ring-white/20">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="destructive"
                onClick={() => setIsAddItemOpen(false)}
                className="bg-red-500 hover:bg-red-600 text-white shadow-md"
              >
                Cancel
              </Button>
              <Button onClick={handleAddItem} disabled={isAdding}>
                {isAdding ? "Adding..." : "Add Item"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function MenuItemCard({
  item,
  onToggleAvailability,
  index,
}: {
  item: MenuItem;
  onToggleAvailability: (itemId: string, status: boolean, name: string) => void;
  index: number;
}) {
  // Select a placeholder image based on category or random food if none provided
  const getImage = (catId: string, name: string) => {
    // Simple hash to consistent random image
    const code = name.length % 5;
    // Using generic high quality food placeholders
    // In a real app, these would be real URLs from the item.image field
    if (item.image && item.image.startsWith("http")) return item.image;

    const images = [
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80", // Salad
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80", // Pizza
      "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=500&q=80", // Toast
      "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=500&q=80", // French Toast
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=500&q=80", // Salad 2
    ];
    return images[code] || images[0];
  };

  const staggerClass = `stagger-${(index % 5) + 1}`;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-white/20 bg-black/30 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:bg-black/40 animate-entry",
        !item.isAvailable && "opacity-60 grayscale",
        staggerClass
      )}
    >
      {/* Image Area */}
      <div className="relative h-48 w-full overflow-hidden">
        <img
          src={getImage(item.categoryId, item.name)}
          alt={item.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

        {/* Price Tag */}
        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
          <p className="text-lg font-bold text-white flex items-center text-shadow-sm">
            <DollarSign className="h-4 w-4 mr-0.5" />
            {item.price.toFixed(2)}
          </p>
        </div>

        {!item.isAvailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <Badge variant="destructive" className="text-lg px-4 py-2 border-2">
              Out of Stock
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-xl text-white group-hover:text-primary transition-colors truncate text-shadow">
            {item.name}
          </h3>
          <Switch
            checked={item.isAvailable}
            onCheckedChange={(e) => {
              // Stop propagation to prevent card click if we had one
              onToggleAvailability(item.id, item.isAvailable, item.name)
            }}
            className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-slate-600"
          />
        </div>

        <p className="text-sm text-gray-200 line-clamp-2 min-h-[2.5rem] mb-4 text-shadow-sm">
          {item.description || "Freshly prepared with quality ingredients."}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-300 border-t border-white/20 pt-3">
          <span>{item.isAvailable ? "Available Now" : "Unavailable"}</span>
          <span className="flex items-center gap-1 text-primary">
            View Details
          </span>
        </div>
      </div>
    </div>
  );
}
