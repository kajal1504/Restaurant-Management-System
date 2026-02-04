"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth, getRoleBadgeColor } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger, 
  SheetTitle, 
  SheetDescription 
} from "@/components/ui/sheet";
import { Sidebar } from "@/components/sidebar"; 
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Menu,
  LogOut,
  UtensilsCrossed,
} from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, role, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full">
      {/* Desktop Sidebar */}
      <div className="hidden w-64 border-r bg-muted/40 md:block shrink-0">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-15 lg:px-6">
            <div className="flex items-center gap-2 font-semibold">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <UtensilsCrossed className="h-4 w-4" />
              </div>
              <span className="">TableFlow</span>
            </div>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <Sidebar role={role || undefined} />
            </nav>
          </div>
        </div>
      </div>

      {/* Main Layout Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-15 lg:px-6">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col bg-background p-0 w-64">
              <SheetTitle className="sr-only">Mobile Navigation</SheetTitle>
              <SheetDescription className="sr-only">
                Navigation menu for mobile devices
              </SheetDescription>

              <div className="flex h-14 items-center gap-2 px-6 border-b border-border">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <UtensilsCrossed className="h-4 w-4" />
                </div>
                <span className="font-semibold text-foreground">TableFlow</span>
              </div>
              <div className="py-4 px-3">
                <Sidebar
                  role={role || undefined}
                  onLinkClick={() => setMobileMenuOpen(false)}
                />
              </div>
            </SheetContent>
          </Sheet>

          <div className="w-full flex-1"></div>

          <div className="flex items-center gap-2">
            <Badge className={cn("text-xs", getRoleBadgeColor(role || "waiter"))}>
              {role || "Loading..."}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-secondary text-secondary-foreground text-sm">
                      {user?.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.email?.split('@')[0]}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

























 