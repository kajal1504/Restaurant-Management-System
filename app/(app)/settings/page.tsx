"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TablesSettings } from "@/components/settings/tables-settings";
import { CategoriesSettings } from "@/components/settings/categories-settings";
import { MenuItemsSettings } from "@/components/settings/menu-items-settings";
import { Grid3X3, FolderTree, UtensilsCrossed } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("tables");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Restaurant Setup</h1>
        <p className="text-muted-foreground">
          Configure your tables, menu categories, and items.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-secondary/50 border border-border">
          <TabsTrigger value="tables" className="flex items-center gap-2">
            <Grid3X3 className="h-4 w-4" />
            <span className="hidden sm:inline">Tables</span>
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <FolderTree className="h-4 w-4" />
            <span className="hidden sm:inline">Categories</span>
          </TabsTrigger>
          <TabsTrigger value="menu" className="flex items-center gap-2">
            <UtensilsCrossed className="h-4 w-4" />
            <span className="hidden sm:inline">Menu Items</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tables">
          <TablesSettings />
        </TabsContent>

        <TabsContent value="categories">
          <CategoriesSettings />
        </TabsContent>

        <TabsContent value="menu">
          <MenuItemsSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
