"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { EmptyState } from "@/components/empty-state";
import { mockCategories } from "@/lib/mock-data";
import type { MenuCategory } from "@/lib/types";
import { Plus, Pencil, Trash2, GripVertical, Eye, EyeOff, FolderTree } from "lucide-react";
import { toast } from "sonner";

interface CategoryFormData {
  name: string;
  isVisible: boolean;
}

export function CategoriesSettings() {
  const [categories, setCategories] = useState<MenuCategory[]>(mockCategories);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    isVisible: true,
  });

  const resetForm = () => {
    setFormData({ name: "", isVisible: true });
    setEditingCategory(null);
  };

  const handleOpenDialog = (category?: MenuCategory) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        isVisible: category.isVisible,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    if (editingCategory) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingCategory.id
            ? { ...c, name: formData.name, isVisible: formData.isVisible }
            : c
        )
      );
      toast.success("Category updated successfully");
    } else {
      const newCategory: MenuCategory = {
        id: `c${Date.now()}`,
        name: formData.name,
        order: categories.length + 1,
        isVisible: formData.isVisible,
      };
      setCategories((prev) => [...prev, newCategory]);
      toast.success("Category added successfully");
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = (categoryId: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    toast.success("Category deleted successfully");
  };

  const handleToggleVisibility = (categoryId: string) => {
    setCategories((prev) =>
      prev.map((c) =>
        c.id === categoryId ? { ...c, isVisible: !c.isVisible } : c
      )
    );
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newCategories = [...categories];
    [newCategories[index - 1], newCategories[index]] = [
      newCategories[index],
      newCategories[index - 1],
    ];
    // Update order values
    newCategories.forEach((c, i) => {
      c.order = i + 1;
    });
    setCategories(newCategories);
  };

  const handleMoveDown = (index: number) => {
    if (index === categories.length - 1) return;
    const newCategories = [...categories];
    [newCategories[index], newCategories[index + 1]] = [
      newCategories[index + 1],
      newCategories[index],
    ];
    // Update order values
    newCategories.forEach((c, i) => {
      c.order = i + 1;
    });
    setCategories(newCategories);
  };

  if (categories.length === 0) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="py-10">
          <EmptyState
            icon={FolderTree}
            title="No categories yet"
            description="Create your first menu category to organize your dishes."
            action={{
              label: "Add Category",
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
          <CardTitle className="text-foreground">Menu Categories</CardTitle>
          <CardDescription>Organize your menu with categories. Drag to reorder.</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
              <DialogDescription>
                {editingCategory
                  ? "Update the category details below."
                  : "Enter a name for the new category."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Appetizers, Main Course"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Visible on Menu</Label>
                  <p className="text-xs text-muted-foreground">
                    Show this category to customers
                  </p>
                </div>
                <Switch
                  checked={formData.isVisible}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, isVisible: checked }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {editingCategory ? "Save Changes" : "Add Category"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {categories
            .sort((a, b) => a.order - b.order)
            .map((category, index) => (
              <div
                key={category.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === categories.length - 1}
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{category.name}</p>
                  <p className="text-xs text-muted-foreground">Order: {category.order}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className={category.isVisible ? "text-success" : "text-muted-foreground"}
                  onClick={() => handleToggleVisibility(category.id)}
                >
                  {category.isVisible ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleOpenDialog(category)}
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
                      <AlertDialogTitle>Delete {category.name}?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete this category and all associated menu items.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => handleDelete(category.id)}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
