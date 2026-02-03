"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockMenuItems, mockCategories } from "@/lib/mock-data";
import type { MenuItem, MenuCategory } from "@/lib/types";
import { Search, DollarSign, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>(mockMenuItems);
  const [categories] = useState<MenuCategory[]>(mockCategories);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

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

  const handleToggleAvailability = (itemId: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId ? { ...i, isAvailable: !i.isAvailable } : i
      )
    );
    const item = items.find((i) => i.id === itemId);
    toast.success(
      item?.isAvailable ? `${item.name} marked as out of stock` : `${item?.name} now available`
    );
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || "Unknown";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Menu</h1>
        <p className="text-muted-foreground">
          View and manage menu item availability.
        </p>
      </div>

      {/* Search */}
      <Card className="border-border bg-card">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-secondary/50 border border-border p-1">
          <TabsTrigger value="all" className="flex-shrink-0">
            All Items
          </TabsTrigger>
          {visibleCategories.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="flex-shrink-0">
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
                  <Card key={category.id} className="border-border bg-card">
                    <CardHeader>
                      <CardTitle className="text-foreground flex items-center gap-2">
                        {category.name}
                        <Badge variant="secondary">{categoryItems.length}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {categoryItems.map((item) => (
                          <MenuItemCard
                            key={item.id}
                            item={item}
                            onToggleAvailability={handleToggleAvailability}
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
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">
                  {getCategoryName(activeCategory)}
                </CardTitle>
                <CardDescription>
                  {filteredItems.length} items in this category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredItems.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      onToggleAvailability={handleToggleAvailability}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {filteredItems.length === 0 && (
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
    </div>
  );
}

function MenuItemCard({
  item,
  onToggleAvailability,
}: {
  item: MenuItem;
  onToggleAvailability: (itemId: string) => void;
}) {
  return (
    <div
      className={cn(
        "p-4 rounded-lg border border-border bg-secondary/30 transition-all",
        !item.isAvailable && "opacity-60"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-foreground truncate">{item.name}</p>
            {!item.isAvailable && (
              <Badge
                variant="outline"
                className="text-xs bg-destructive/10 text-destructive border-destructive/30 flex-shrink-0"
              >
                Out of Stock
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {item.description}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
        <p className="text-lg font-bold text-primary flex items-center">
          <DollarSign className="h-4 w-4" />
          {item.price.toFixed(2)}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {item.isAvailable ? "Available" : "Unavailable"}
          </span>
          <Switch
            checked={item.isAvailable}
            onCheckedChange={() => onToggleAvailability(item.id)}
          />
        </div>
      </div>
    </div>
  );
}
