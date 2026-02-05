import { db } from "./firebase";
import {
      collection,
      doc,
      setDoc,
      updateDoc,
      onSnapshot,
      query,
      orderBy,
      where,
      limit,
      startAt,
      endAt,
      writeBatch,
      Timestamp,
      addDoc,
      deleteDoc,
      getDoc,
} from "firebase/firestore";
import { mockMenuItems, mockCategories, mockTables, mockOrders } from "./mock-data";
import type { MenuItem, MenuCategory, Table, TableStatus, Order, OrderStatus } from "./types";

// Collection References
const COLLECTION_MENU_ITEMS = "menu_items";
const COLLECTION_MENU_CATEGORIES = "menu_categories";
const COLLECTION_TABLES = "tables";
const COLLECTION_ORDERS = "orders";

// --- SEEDING FUNCTION ---
export const seedDatabase = async () => {
      const batch = writeBatch(db);

      // Seed Menu Categories
      mockCategories.forEach((cat) => {
            const docRef = doc(db, COLLECTION_MENU_CATEGORIES, cat.id);
            batch.set(docRef, cat);
      });

      // Seed Menu Items
      mockMenuItems.forEach((item) => {
            const docRef = doc(db, COLLECTION_MENU_ITEMS, item.id);
            batch.set(docRef, item);
      });

      // Seed Tables
      mockTables.forEach((table) => {
            const docRef = doc(db, COLLECTION_TABLES, table.id);
            // Ensure undefined fields are handled or removed if needed, default firebase ignores undefined in some SDK versions but safe to be explicit
            const tableData = { ...table };
            if (!tableData.currentOrderId) delete tableData.currentOrderId;
            batch.set(docRef, tableData);
      });

      // Seed Orders
      mockOrders.forEach((order) => {
            const docRef = doc(db, COLLECTION_ORDERS, order.id);
            const orderData = {
                  ...order,
                  createdAt: order.createdAt,
                  updatedAt: order.updatedAt,
            };
            batch.set(docRef, orderData);
      });

      await batch.commit();
      console.log("Database seeded successfully!");
};

// --- MENU SERVICES ---

export const subscribeToMenuItems = (
      callback: (items: MenuItem[]) => void
) => {
      const q = query(collection(db, COLLECTION_MENU_ITEMS));
      return onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map((doc) => ({
                  id: doc.id,
                  ...doc.data(),
            })) as MenuItem[];
            callback(items);
      });
};

export const subscribeToCategories = (
      callback: (categories: MenuCategory[]) => void
) => {
      const q = query(collection(db, COLLECTION_MENU_CATEGORIES), orderBy("order"));
      return onSnapshot(q, (snapshot) => {
            const categories = snapshot.docs.map((doc) => ({
                  id: doc.id,
                  ...doc.data(),
            })) as MenuCategory[];
            callback(categories);
      });
};

export const toggleMenuItemAvailability = async (
      itemId: string,
      currentStatus: boolean
) => {
      const docRef = doc(db, COLLECTION_MENU_ITEMS, itemId);
      await updateDoc(docRef, { isAvailable: !currentStatus });
};

export const addMenuItem = async (itemData: Omit<MenuItem, "id">) => {
      const docRef = await addDoc(collection(db, COLLECTION_MENU_ITEMS), itemData);
      return docRef.id;
};

// --- TABLE SERVICES ---

export const subscribeToTables = (callback: (tables: Table[]) => void) => {
      const q = query(collection(db, COLLECTION_TABLES), orderBy("number"));
      return onSnapshot(q, (snapshot) => {
            const tables = snapshot.docs.map((doc) => ({
                  id: doc.id,
                  ...doc.data(),
            })) as Table[];
            callback(tables);
      });
};

export const updateTableStatus = async (
      tableId: string,
      status: TableStatus
) => {
      const docRef = doc(db, COLLECTION_TABLES, tableId);
      await updateDoc(docRef, { status });
};

export const addTable = async (tableData: Omit<Table, "id">) => {
      // Use custom ID based on table number or auto-generated
      // Ideally table number should be unique.
      // For simplicity here using auto-generated ID, but we could use `table-${tableData.number}`
      const docRef = await addDoc(collection(db, COLLECTION_TABLES), tableData);
      return docRef.id;
};

export const deleteTable = async (tableId: string) => {
      await deleteDoc(doc(db, COLLECTION_TABLES, tableId));
};

// --- ORDER SERVICES ---

// Generic converter to avoid repetition
const mapOrderDocs = (snapshot: any) => {
      return snapshot.docs.map((doc: any) => {
            const data = doc.data();
            return {
                  id: doc.id,
                  ...data,
                  createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
                  updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
            };
      }) as Order[];
};

// 1. For Orders Page: Get recent orders (limit 50) to avoid reading history
export const subscribeToOrders = (callback: (orders: Order[]) => void) => {
      const q = query(collection(db, COLLECTION_ORDERS), orderBy("createdAt", "desc"), limit(50));
      return onSnapshot(q, (snapshot) => callback(mapOrderDocs(snapshot)));
};

// 2. For Kitchen: Only 'pending' and 'in-preparation'
export const subscribeToKitchenOrders = (callback: (orders: Order[]) => void) => {
      const q = query(
            collection(db, COLLECTION_ORDERS),
            where("status", "in", ["pending", "in-preparation"]),
            orderBy("createdAt", "asc") // Oldest first for kitchen
      );
      return onSnapshot(q, (snapshot) => callback(mapOrderDocs(snapshot)));
};

// 3. For Billing: Only 'served' (ready to pay) or 'completed' (for recent history)
// Optimizing to just 'served' for billing workload
export const subscribeToBillableOrders = (callback: (orders: Order[]) => void) => {
      const q = query(
            collection(db, COLLECTION_ORDERS),
            where("status", "==", "served"),
            orderBy("createdAt", "desc")
      );
      return onSnapshot(q, (snapshot) => callback(mapOrderDocs(snapshot)));
};

// 4. For Dashboard: Today's orders for stats
export const subscribeToTodaysOrders = (callback: (orders: Order[]) => void) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const q = query(
            collection(db, COLLECTION_ORDERS),
            where("createdAt", ">=", today),
            orderBy("createdAt", "desc")
      );
      return onSnapshot(q, (snapshot) => callback(mapOrderDocs(snapshot)));
};

export const createOrder = async (order: Order) => {
      const docRef = doc(db, COLLECTION_ORDERS, order.id);

      // Sanitize order object to remove undefined values which Firestore rejects
      const sanitizedItems = order.items.map(item => ({
            ...item,
            notes: item.notes || null // Convert undefined to null
      }));

      const orderData = {
            ...order,
            items: sanitizedItems,
            table: { ...order.table }, // Ensure it's a plain object
            // Ensure dates are valid dates (which they should be, but just in case)
            createdAt: order.createdAt || new Date(),
            updatedAt: order.updatedAt || new Date(),
      };

      await setDoc(docRef, orderData);

      // Auto-update table status to 'occupied'
      if (order.tableId) {
            await updateTableStatus(order.tableId, "occupied");
      }
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
      const docRef = doc(db, COLLECTION_ORDERS, orderId);
      await updateDoc(docRef, {
            status,
            updatedAt: new Date(),
      });
};

export const markOrderAsPaid = async (orderId: string) => {
      const docRef = doc(db, COLLECTION_ORDERS, orderId);
      await updateDoc(docRef, {
            isPaid: true,
            status: "completed",
            updatedAt: new Date(),
      });

      // Also free the table
      const orderSnap = await getDoc(docRef);
      if (orderSnap.exists()) {
            const orderData = orderSnap.data() as Order;
            if (orderData.tableId) {
                  await updateTableStatus(orderData.tableId, "available");
            }
      }
};

export const deleteOrder = async (orderId: string) => {
      await deleteDoc(doc(db, COLLECTION_ORDERS, orderId));
};
