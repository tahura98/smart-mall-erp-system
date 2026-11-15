# 🏢 Smart Mall Management System

A full-stack commercial mall management web application featuring a **Laravel 11 backend** with **Laravel Sanctum authentication** and an enterprise-grade **React + Vite + Tailwind CSS frontend**.

---

## 📁 Project Architecture

```
smart-mall/
├── backend/                                     # Laravel 11 Backend API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── AuthController.php           # Login (token + role), Logout, Me
│   │   │   │   ├── Admin/
│   │   │   │   │   ├── ShopManagementController.php # Admin CRUD for Shops
│   │   │   │   │   └── BillManagementController.php # Admin Generate & Update Monthly Bills
│   │   │   │   ├── Owner/
│   │   │   │   │   ├── OwnerProductController.php   # Shop Owner manage own products
│   │   │   │   │   └── OwnerPOSController.php       # Submit POS Sales (Stock Deduct)
│   │   │   │   ├── DashboardController.php
│   │   │   │   ├── ShopController.php
│   │   │   │   └── ProductController.php
│   │   │   └── Middleware/
│   │   │       └── EnsureRole.php               # Role authorization (admin / shop_owner)
│   │   └── Models/
│   │       ├── User.php                         # HasApiTokens (Sanctum), roles: admin, shop_owner
│   │       ├── Shop.php                         # shop_number, floor_name, shop_name, owner_id, monthly_rent
│   │       ├── Bill.php                         # shop_id, month_year, rent_amount, utility_bill, status
│   │       ├── Product.php                      # shop_id, name, barcode, price, stock
│   │       ├── Sale.php                         # shop_id, total_amount, invoice_number
│   │       └── SaleItem.php                     # sale_id, product_id, quantity, unit_price, subtotal
│   ├── config/
│   │   ├── cors.php                             # CORS for React Vite (localhost:5173, credentials: true)
│   │   ├── sanctum.php                          # Laravel Sanctum configuration
│   │   └── database.php                         # MySQL database configuration (smart_mall_db)
│   ├── database/
│   │   ├── migrations/                          # Typed database migrations
│   │   │   ├── 0001_01_01_000000_create_users_table.php
│   │   │   ├── 2024_01_01_000000_create_personal_access_tokens_table.php (Sanctum)
│   │   │   ├── 2024_01_01_000001_create_shops_table.php
│   │   │   ├── 2024_01_01_000002_create_bills_table.php
│   │   │   ├── 2024_01_01_000003_create_products_table.php
│   │   │   ├── 2024_01_01_000004_create_sales_table.php
│   │   │   └── 2024_01_01_000005_create_sale_items_table.php
│   │   ├── seeders/
│   │   │   └── DatabaseSeeder.php               # 1 Admin, 3 Owners, 3 Shops, Bills, Products, Sales
│   │   └── schema_and_seed.sql                  # Direct SQL dump for MySQL / phpMyAdmin import
│   ├── routes/
│   │   ├── api.php                              # RESTful API routes with Sanctum & Role middleware
│   │   └── web.php
│   └── .env                                     # Preconfigured for MySQL smart_mall_db
│
└── frontend/                                    # React + Vite + Tailwind CSS Frontend
    ├── src/
    │   ├── api/
    │   │   └── axios.js                         # Axios client with Sanctum Bearer token interceptor
    │   ├── context/
    │   │   └── AuthContext.jsx                  # Persistent auth session & role state
    │   ├── components/
    │   │   ├── common/
    │   │   │   └── Header.jsx                   # Role-aware header & quick logout
    │   │   └── ProtectedRoute.jsx               # Route guards for admin & shop_owner
    │   ├── pages/
    │   │   ├── Login.jsx                        # Role-redirect login with 1-click demo buttons
    │   │   ├── admin/
    │   │   │   └── AdminDashboard.jsx           # KPI cards, Shops CRUD + modal, Billing Paid/Due toggles
    │   │   └── owner/
    │   │       └── OwnerDashboard.jsx           # Split-screen POS billing, live cart, printable invoice modal
    │   ├── data/
    │   │   └── mockData.js                      # Seed dataset matching Laravel DatabaseSeeder
    │   ├── App.jsx                              # react-router-dom router setup
    │   ├── index.css                            # Tailwind CSS directives
    │   └── main.jsx
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
```

---

## 🖥️ Frontend Features & Routes

### 1. Authentication & Role Routing (`/login`)
- **Login Page**: Clean, modern card with email and password fields.
- **1-Click Demo Accounts**:
  - `admin@smartmall.com` &rarr; redirects to `/admin`
  - `alex@urbanthreads.com` &rarr; redirects to `/owner`
- **Sanctum Integration**: Automatically stores token in `localStorage` and attaches `Authorization: Bearer <token>` to all subsequent requests via Axios interceptors.

---

### 2. Admin Dashboard (`/admin`)
- **Summary KPI Cards**:
  - **Total Shops** count across floors.
  - **Collected Rent**: Sum of all paid lease and utility bills.
  - **Due / Pending Rent**: Sum of all unpaid and pending collections.
  - **Contractual Monthly Base**: Aggregate monthly target.
- **Shops Management Table**:
  - Filter by floor (Ground Floor, 1st Floor, 2nd Floor) and search by name/number.
  - **'Add Shop' Modal**: Register new retail stores with shop number, floor, assigned owner, and monthly rent.
- **Billing Management Ledger**:
  - Complete invoice listing with status badges (`Paid`, `Due/Unpaid`, `Pending`).
  - One-click actions to toggle bills as **Mark as Paid** or **Mark as Due**.
  - **'Generate Monthly Bill' Modal**: Create monthly bills with rent and utility charges.

---

### 3. Shop Owner Dashboard (`/owner`)
- **Split-Screen POS Billing Terminal**:
  - **Left Side (Product Catalog Grid)**:
    - Search by product name or scan barcode.
    - Click any product to add directly to the cart.
    - Live stock badges; disabled if sold out.
  - **Right Side (Live Cart)**:
    - Quantity adjusters (`+`, `-`) with real-time stock limits.
    - Line item subtotals and discount selector (0%, 5%, 10%, 15%).
    - Grand total calculation.
  - **Printable Invoice Receipt Modal**:
    - Generates professional store receipt with Invoice Number, Date, Cashier, Itemized breakdown, and barcode.
    - One-click **Print Receipt** via `window.print()`.
  - **Automatic Inventory Deduction**:
    - Completing a sale automatically deducts product inventory in state and calls `/api/owner/sales/pos`.
- **Inventory Management View**:
  - Full catalog table with barcodes, prices, stock levels, low-stock warnings, and quick stock adjustment controls.
  - **'Add Product to Catalog' Modal**: Register new inventory items.
- **Sales History**:
  - Ledger of all past invoices, timestamps, and total amounts.

---

## 🚀 Running the Full Stack App

### 1. Backend (Laravel API + MySQL)
```powershell
# In /backend directory
mysql -u root < database/schema_and_seed.sql
php artisan serve
```

### 2. Frontend (React + Vite + Tailwind CSS)
```powershell
# In /frontend directory
npm install
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.
