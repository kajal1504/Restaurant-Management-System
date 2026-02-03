import type {
  User,
  Table,
  MenuCategory,
  MenuItem,
  Order,
  DashboardStats,
} from "./types";

// Mock Users
export const mockUsers: User[] = [
  { id: "1", email: "admin@tableflow.com", name: "John Admin", role: "admin" },
  { id: "2", email: "manager@tableflow.com", name: "Sarah Manager", role: "manager" },
  { id: "3", email: "waiter@tableflow.com", name: "Mike Waiter", role: "waiter" },
  { id: "4", email: "cashier@tableflow.com", name: "Lisa Cashier", role: "cashier" },
];

// Mock Tables
export const mockTables: Table[] = [
  { id: "t1", number: 1, capacity: 2, status: "available" },
  { id: "t2", number: 2, capacity: 4, status: "occupied", currentOrderId: "o1" },
  { id: "t3", number: 3, capacity: 4, status: "occupied", currentOrderId: "o2" },
  { id: "t4", number: 4, capacity: 6, status: "reserved" },
  { id: "t5", number: 5, capacity: 2, status: "available" },
  { id: "t6", number: 6, capacity: 8, status: "occupied", currentOrderId: "o3" },
  { id: "t7", number: 7, capacity: 4, status: "available" },
  { id: "t8", number: 8, capacity: 2, status: "reserved" },
  { id: "t9", number: 9, capacity: 6, status: "available" },
  { id: "t10", number: 10, capacity: 4, status: "occupied", currentOrderId: "o4" },
  { id: "t11", number: 11, capacity: 2, status: "available" },
  { id: "t12", number: 12, capacity: 8, status: "available" },
];

// Mock Menu Categories
export const mockCategories: MenuCategory[] = [
  { id: "c1", name: "Appetizers", order: 1, isVisible: true },
  { id: "c2", name: "Main Courses", order: 2, isVisible: true },
  { id: "c3", name: "Desserts", order: 3, isVisible: true },
  { id: "c4", name: "Beverages", order: 4, isVisible: true },
  { id: "c5", name: "Specials", order: 5, isVisible: false },
];

// Mock Menu Items
export const mockMenuItems: MenuItem[] = [
  // Appetizers
  { id: "m1", name: "Bruschetta", description: "Grilled bread with tomatoes, garlic, and basil", price: 8.99, categoryId: "c1", isAvailable: true },
  { id: "m2", name: "Calamari Fritti", description: "Crispy fried calamari with marinara sauce", price: 12.99, categoryId: "c1", isAvailable: true },
  { id: "m3", name: "Caprese Salad", description: "Fresh mozzarella, tomatoes, and basil drizzle", price: 10.99, categoryId: "c1", isAvailable: true },
  { id: "m4", name: "Soup of the Day", description: "Ask your server for today's selection", price: 6.99, categoryId: "c1", isAvailable: false },
  
  // Main Courses
  { id: "m5", name: "Grilled Salmon", description: "Atlantic salmon with lemon herb butter", price: 24.99, categoryId: "c2", isAvailable: true },
  { id: "m6", name: "Ribeye Steak", description: "12oz prime cut with garlic mashed potatoes", price: 34.99, categoryId: "c2", isAvailable: true },
  { id: "m7", name: "Chicken Parmesan", description: "Breaded chicken with marinara and melted cheese", price: 18.99, categoryId: "c2", isAvailable: true },
  { id: "m8", name: "Mushroom Risotto", description: "Creamy arborio rice with wild mushrooms", price: 16.99, categoryId: "c2", isAvailable: true },
  { id: "m9", name: "Lobster Tail", description: "Butter-poached Maine lobster tail", price: 42.99, categoryId: "c2", isAvailable: false },
  
  // Desserts
  { id: "m10", name: "Tiramisu", description: "Classic Italian coffee-flavored dessert", price: 8.99, categoryId: "c3", isAvailable: true },
  { id: "m11", name: "Chocolate Lava Cake", description: "Warm chocolate cake with molten center", price: 9.99, categoryId: "c3", isAvailable: true },
  { id: "m12", name: "Cheesecake", description: "New York style with berry compote", price: 8.99, categoryId: "c3", isAvailable: true },
  
  // Beverages
  { id: "m13", name: "Espresso", description: "Double shot of Italian espresso", price: 3.99, categoryId: "c4", isAvailable: true },
  { id: "m14", name: "Fresh Lemonade", description: "House-made with fresh lemons", price: 4.99, categoryId: "c4", isAvailable: true },
  { id: "m15", name: "Iced Tea", description: "Refreshing black tea with lemon", price: 3.49, categoryId: "c4", isAvailable: true },
  { id: "m16", name: "Sparkling Water", description: "San Pellegrino 500ml", price: 4.99, categoryId: "c4", isAvailable: true },
];

// Helper function to get menu item by id
export const getMenuItem = (id: string): MenuItem | undefined => 
  mockMenuItems.find(item => item.id === id);

// Helper function to get table by id
export const getTable = (id: string): Table | undefined => 
  mockTables.find(table => table.id === id);

// Mock Orders
export const mockOrders: Order[] = [
  {
    id: "o1",
    tableId: "t2",
    table: mockTables[1],
    items: [
      { id: "oi1", menuItemId: "m1", menuItem: mockMenuItems[0], quantity: 2, price: 8.99 },
      { id: "oi2", menuItemId: "m5", menuItem: mockMenuItems[4], quantity: 1, price: 24.99 },
      { id: "oi3", menuItemId: "m14", menuItem: mockMenuItems[13], quantity: 2, price: 4.99 },
    ],
    status: "in-preparation",
    subtotal: 52.95,
    tax: 4.24,
    total: 57.19,
    createdAt: new Date(Date.now() - 30 * 60000),
    updatedAt: new Date(Date.now() - 10 * 60000),
    isPaid: false,
  },
  {
    id: "o2",
    tableId: "t3",
    table: mockTables[2],
    items: [
      { id: "oi4", menuItemId: "m2", menuItem: mockMenuItems[1], quantity: 1, price: 12.99 },
      { id: "oi5", menuItemId: "m6", menuItem: mockMenuItems[5], quantity: 2, price: 34.99 },
      { id: "oi6", menuItemId: "m11", menuItem: mockMenuItems[10], quantity: 2, price: 9.99 },
    ],
    status: "served",
    subtotal: 102.95,
    tax: 8.24,
    total: 111.19,
    createdAt: new Date(Date.now() - 60 * 60000),
    updatedAt: new Date(Date.now() - 5 * 60000),
    isPaid: false,
  },
  {
    id: "o3",
    tableId: "t6",
    table: mockTables[5],
    items: [
      { id: "oi7", menuItemId: "m3", menuItem: mockMenuItems[2], quantity: 3, price: 10.99 },
      { id: "oi8", menuItemId: "m7", menuItem: mockMenuItems[6], quantity: 4, price: 18.99 },
      { id: "oi9", menuItemId: "m8", menuItem: mockMenuItems[7], quantity: 2, price: 16.99 },
      { id: "oi10", menuItemId: "m10", menuItem: mockMenuItems[9], quantity: 4, price: 8.99 },
    ],
    status: "pending",
    subtotal: 178.89,
    tax: 14.31,
    total: 193.20,
    createdAt: new Date(Date.now() - 5 * 60000),
    updatedAt: new Date(Date.now() - 5 * 60000),
    isPaid: false,
  },
  {
    id: "o4",
    tableId: "t10",
    table: mockTables[9],
    items: [
      { id: "oi11", menuItemId: "m1", menuItem: mockMenuItems[0], quantity: 1, price: 8.99 },
      { id: "oi12", menuItemId: "m8", menuItem: mockMenuItems[7], quantity: 2, price: 16.99 },
      { id: "oi13", menuItemId: "m13", menuItem: mockMenuItems[12], quantity: 2, price: 3.99 },
    ],
    status: "in-preparation",
    subtotal: 50.95,
    tax: 4.08,
    total: 55.03,
    createdAt: new Date(Date.now() - 20 * 60000),
    updatedAt: new Date(Date.now() - 15 * 60000),
    isPaid: false,
  },
];

// Mock Dashboard Stats
export const mockDashboardStats: DashboardStats = {
  activeTables: 4,
  totalTables: 12,
  activeOrders: 4,
  dailyRevenue: 1847.50,
  ordersByStatus: {
    pending: 1,
    "in-preparation": 2,
    served: 1,
    completed: 12,
    cancelled: 1,
  },
};
