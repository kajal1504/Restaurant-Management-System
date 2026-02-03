"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { mockTables } from "@/lib/mock-data";
import type { Table, TableStatus } from "@/lib/types";
import { Plus, Pencil, Trash2, Users, Grid3X3 } from "lucide-react";
import { toast } from "sonner";

interface TableFormData {
  number: number;
  capacity: number;
  status: TableStatus;
}

export function TablesSettings() {
  const [tables, setTables] = useState<Table[]>(mockTables);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [formData, setFormData] = useState<TableFormData>({
    number: 1,
    capacity: 2,
    status: "available",
  });

  const resetForm = () => {
    setFormData({ number: 1, capacity: 2, status: "available" });
    setEditingTable(null);
  };

  const handleOpenDialog = (table?: Table) => {
    if (table) {
      setEditingTable(table);
      setFormData({
        number: table.number,
        capacity: table.capacity,
        status: table.status,
      });
    } else {
      resetForm();
      // Set next available table number
      const maxNumber = Math.max(...tables.map((t) => t.number), 0);
      setFormData((prev) => ({ ...prev, number: maxNumber + 1 }));
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (editingTable) {
      setTables((prev) =>
        prev.map((t) =>
          t.id === editingTable.id
            ? { ...t, ...formData }
            : t
        )
      );
      toast.success("Table updated successfully");
    } else {
      const newTable: Table = {
        id: `t${Date.now()}`,
        ...formData,
      };
      setTables((prev) => [...prev, newTable]);
      toast.success("Table added successfully");
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = (tableId: string) => {
    setTables((prev) => prev.filter((t) => t.id !== tableId));
    toast.success("Table deleted successfully");
  };

  if (tables.length === 0) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="py-10">
          <EmptyState
            icon={Grid3X3}
            title="No tables configured"
            description="Add your first table to start managing your restaurant floor."
            action={{
              label: "Add Table",
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
          <CardTitle className="text-foreground">Tables</CardTitle>
          <CardDescription>Manage your restaurant tables and seating.</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Table
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingTable ? "Edit Table" : "Add New Table"}</DialogTitle>
              <DialogDescription>
                {editingTable
                  ? "Update the table details below."
                  : "Enter the details for the new table."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="number">Table Number</Label>
                <Input
                  id="number"
                  type="number"
                  min={1}
                  value={formData.number}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, number: parseInt(e.target.value) || 1 }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Seating Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  min={1}
                  max={20}
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, capacity: parseInt(e.target.value) || 2 }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: TableStatus) =>
                    setFormData((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
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
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {editingTable ? "Save Changes" : "Add Table"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tables.map((table) => (
            <div
              key={table.id}
              className="flex flex-col p-4 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">
                    {table.number}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Table {table.number}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {table.capacity} seats
                    </p>
                  </div>
                </div>
                <StatusBadge status={table.status} />
              </div>
              <div className="flex items-center gap-2 mt-auto pt-3 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleOpenDialog(table)}
                >
                  <Pencil className="mr-1 h-3 w-3" />
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Table {table.number}?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the table.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => handleDelete(table.id)}
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
      </CardContent>
    </Card>
  );
}
