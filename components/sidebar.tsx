
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ClipboardList,
  Grid3X3,
  CreditCard,
  ChefHat,
  BarChart3,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: ("admin" | "manager" | "waiter" | "cashier" | "kitchen" | "staff")[];
}

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["admin", "manager"] },
  { label: "Tables", href: "/tables", icon: Grid3X3, roles: ["admin", "manager", "waiter"] },
  { label: "Orders", href: "/orders", icon: ClipboardList, roles: ["admin", "manager", "waiter", "cashier"] },
  { label: "Menu", href: "/menu", icon: UtensilsCrossed, roles: ["admin", "manager", "waiter"] },
  { label: "Billing", href: "/billing", icon: CreditCard, roles: ["admin", "manager", "waiter", "cashier"] },
  { label: "Kitchen", href: "/kitchen", icon: ChefHat, roles: ["admin", "manager", "kitchen"] },
  { label: "Analytics", href: "/analytics", icon: BarChart3, roles: ["admin", "manager"] },
];

interface SidebarProps {
  className?: string;
  onLinkClick?: () => void;
  role?: string;
}

export function Sidebar({ className, onLinkClick, role }: SidebarProps) {
  const pathname = usePathname();

   
  // const currentRole = role || "admin"; 
  const currentRole = role;

  const filteredNavItems = navItems.filter(
    (item) => item.roles.includes(currentRole as NavItem["roles"][number])
  );

  return (
    <nav className={cn("flex flex-col gap-1", className)}>
      {filteredNavItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onLinkClick}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

























 