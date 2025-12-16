# Polar Inventory

**Polar Inventory** is an offline-first inventory and sales tracking web application designed for small shop owners.  
It focuses on reliability, simplicity, and mobile-friendly “app-like” behavior rather than being a full POS system.

The system works **offline**, syncs automatically when back online, and supports **multi-device usage with controlled device limits** — making it suitable for real-world retail environments with unstable connectivity.

---

## Key Features

### Inventory Management

- Create, update, and delete inventory items
- Stock quantity tracking
- Optimized for mobile usage
- Safe offline creation and automatic cloud syncing as soon as the internet is restored

### Sales & History

- Create transactions (sales and purchase) online or offline
- Automatically generates history records
- Printable invoice view
- Offline transactions sync when reconnected

### Offline-First Architecture

- Works fully without internet connection
- IndexedDB used for local persistence
- Queue-based sync mechanism
- Conflict-safe syncing strategy

### Authentication & Security

- Supabase authentication
- Row Level Security (RLS) enforced everywhere
- User data fully isolated by `auth.uid()`

### App-Like Navigation (PWA-Style)

- Mobile-first navigation
- Controlled back-button behavior
- No “web-like” deep history confusion
- Designed to feel like a native app

### Device Limit Control

- Default device limit per user (e.g. 3 devices)
- Admin-controlled device limit upgrades
- Automatic logout of oldest device when limit is exceeded
- No manual device management required by users

### Admin Panel

- View and manage users
- Promote/extend premium features for users
- Adjust device limits
- Admin-only protected routes

---

## Tech Stack

### Frontend

- React
- React Router
- Context API
- IndexedDB
- Bootstrap + custom styling
- PWA-friendly navigation patterns

### Backend / Cloud

- Supabase
  - Authentication
  - PostgreSQL
  - Row Level Security (RLS)
  - Realtime sync

### Deployment

- Vercel (frontend)
- Supabase (backend)

---

## Project Structure (Simplified)

```
src/
├── components/
├── contexts/
│ ├── AuthContext
│ ├── ItemsContext
│ ├── CartContext
│ ├── SyncContext
│ └── ProfileContext
├── utils/
│ └── sampleInvoice.jsx
├── pages/
├── routes/
└── static pages/
```

---

## Offline Sync Design

- All inventory, cart, and history data is stored locally using IndexedDB
- Actions performed offline are queued
- When connectivity is restored:
  - Queued actions are synced to Supabase
  - Conflicts are resolved safely
- Users can continue working uninterrupted

**Note: If an item is used in an offline transaction just after being created offline (without syncing with database), the item will not be uploaded when the internet is restored.**

This design is intentional and suitable for:

- Small shops
- Mobile usage
- Poor or unstable internet environments

---

## Security Model

- Supabase **anon key** is used on the frontend
- All tables protected with Row Level Security
- Users can only access their own data
- Admin actions are restricted via role-based policies

---

## Getting Started (Local Development)

### 1. Clone the repository

```
git clone https://github.com/GabrielHlaing/polar-inventory.git

cd polar-inventory
```

### 2. Install dependencies

```
npm install
```

### 3. Run the app

```
npm run dev
```

---

## Notes

- This project is **not a full POS system**
- Payment processing is not included
- Designed as an inventory + sales tracking tool
- Built with real-world offline usage in mind

---

## Future Improvements

- Product variants
- Customer management
- Profit tracking
- Cloud backups & export
- Role-based staff accounts

---

## Author

Built by **Htet Aung Hlaing**  
Designed as an offline-first SaaS-ready application and portfolio project.
