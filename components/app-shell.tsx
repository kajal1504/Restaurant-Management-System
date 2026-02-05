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
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden w-64 border-r border-white/10 md:block shrink-0 h-full overflow-hidden animate-entry relative">
        {/* Background Image & Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: `url('/dashboard_shadow_bg.png')` }}
        />
        <div className="absolute inset-0 bg-black/60 z-0" />

        <div className="flex h-full flex-col gap-2 relative z-10">
          <div className="flex h-14 items-center border-b border-white/10 px-4 lg:h-15 lg:px-6 shrink-0">
            <div className="flex items-center gap-2 font-semibold text-white">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg">
                <UtensilsCrossed className="h-4 w-4" />
              </div>
              <span className="drop-shadow-md">TableFlow</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <Sidebar role={role || undefined} />
            </nav>
          </div>
        </div>
      </div>

      {/* Main Layout Content */}
      <div className="flex flex-1 flex-col h-full overflow-hidden">
        <header className="flex h-14 items-center gap-4 border-b border-white/10 px-4 lg:h-15 lg:px-6 shrink-0 z-10 animate-entry stagger-1 relative">
          {/* Background Image & Overlay */}
          <div
            className="absolute inset-0 bg-cover bg-center z-0"
            style={{ backgroundImage: `url('/dashboard_shadow_bg.png')` }}
          />
          <div className="absolute inset-0 bg-black/60 z-0" />

          {/* Header Content Wrapper (Relative z-10) */}
          <div className="flex flex-1 items-center justify-between relative z-10 w-full">
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
              <Badge className={cn("text-xs shadow-md border-white/20", getRoleBadgeColor(role || "waiter"))}>
                {role || "Loading..."}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10 text-white">
                    <Avatar className="h-8 w-8 border border-white/20">
                      <AvatarFallback className="bg-white/10 text-white font-medium text-sm">
                        {user?.email?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 glass border-white/10 bg-black/80 backdrop-blur-xl text-white">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user?.email?.split('@')[0]}</p>
                      <p className="text-xs text-white/50">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem onClick={logout} className="text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6 scroll-smooth animate-entry stagger-2">
          {children}
        </main>
      </div>
    </div>
  );
}

























