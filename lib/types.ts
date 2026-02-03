// User & Authentication Types
export type UserRole = "admin" | "manager" | "waiter" | "cashier";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

// Table Types
export type TableStatus = "available" | "occupied" | "reserved";

export interface Table {
  id: string;
  number: number;
  capacity: number;
  status: TableStatus;
  currentOrderId?: string;
}

// Menu Types
export interface MenuCategory {
  id: string;
  name: string;
  order: number;
  isVisible: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  isAvailable: boolean;
  image?: string;
}

// Order Types
export type OrderStatus = "pending" | "in-preparation" | "served" | "completed" | "cancelled";

export interface OrderItem {
  id: string;
  menuItemId: string;
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
  price: number;
}

export interface Order {
  id: string;
  tableId: string;
  table: Table;
  items: OrderItem[];
  status: OrderStatus;
  subtotal: number;
  tax: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
  isPaid: boolean;
}

// Dashboard Stats
export interface DashboardStats {
  activeTables: number;
  totalTables: number;
  activeOrders: number;
  dailyRevenue: number;
  ordersByStatus: Record<OrderStatus, number>;
}
