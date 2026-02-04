 # TableFlow - Restaurant Management System

TableFlow is a modern, comprehensive Restaurant Management System built with **Next.js 14**, **TypeScript**, and **Firebase**. It streamlines restaurant operations by managing tables, orders, menus, and staff roles in real-time.

## 🚀 Live Demo
**(https://restaurant-management-system-iota-amber.vercel.app/)**


---

## ✨ Features

- **Role-Based Access Control (RBAC):**
  - **Admin/Manager:** Full access to Dashboard, Analytics, and User Management.
  - **Waiter/Staff:** Access to Tables, Orders, and Menu availability.
  - **Kitchen:** Dedicated view for incoming orders and preparation status.
- **Dashboard:** Real-time overview of active tables, daily revenue, and recent order activity.
- **Table Management:**
  - Visual Floor Plan (Grid View) and List View.
  - Real-time status updates (Available 🟢, Occupied 🔴, Reserved 🟡).
- **Order System:**
  - Create and track orders linked to specific tables.
  - Status workflow: Pending → In Preparation → Served → Completed.
- **Menu Management:** Toggle item availability and manage categories.
- **Responsive Design:** Fully optimized for tablets and mobile devices for staff on the move.
- **Dark Mode:** Sleek UI designed for low-light restaurant environments.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js (App Router), React, TypeScript
- **Styling:** Tailwind CSS, Shadcn UI, Lucide Icons
- **Backend/Auth:** Firebase Authentication, Firestore Database
- **State Management:** React Context API

---

## ⚙️ Environment Variables

Create a file named `.env.local` in the root directory and add your Firebase configuration keys:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

## 🚀Install dependencies
     npm install

## 🚀Run the development server
     cd restaurant-rms
     npm run dev


