# Total Office Center (TOC) - Commercial Complex & Shopping Mall Management ERP

A premier enterprise commercial property management ERP engineered for commercial towers, shopping complexes, and mixed-use commercial centers in Bangladesh.

---

## 🏛️ Executive Features

### 1. Executive Management Portal (`super_admin` & `accounts_officer`)
- **Live ERP Dashboard**: Real-time KPI spectrum (Total Units, Occupancy Rate %, Monthly Rent & CAM Collected in ৳, Total Receivables/Due in ৳, Active Facilities & Maintenance Tickets).
- **Floor-Wise Space Utilization Bar Chart**: Dynamic occupancy visualization across architectural levels and zoning blocks.
- **Space & Floor Directory**: Manage Floors (Shopping Mall, Food Court, Corporate Office, Basement Parking, Rooftop Lounge) and Units (Retail Shop, Office Suite, Kiosk) with automated CAM calculations (Sq. Ft. × CAM Rate).
- **Tenant Onboarding & Lease Registry**: Commercial tenancy agreements with Bangladeshi Trade License & 12-digit e-TIN validation, assigning vacant units, and auto-updating unit status to Occupied.
- **Billing & Sub-Meter Utility Engine**: Generate monthly statements with base rent, CAM charges, sub-meter electricity consumption ((Current - Previous) × Rate), and commercial VAT (5.00%).
- **Official Money Receipt & Tax Invoice**: Branded printable official receipts (`window.print()`) complete with complex BIN, trade license, itemized table, and signatory blocks.

### 2. Tenant & Shop Owner Portal (`tenant`)
- View leased shop / corporate office suite specifications, floor area, and contract validity.
- View and download due and settled monthly bills.
- Print official tax invoices and money receipts.
- Direct maintenance desk ticketing for Central AC, electrical distribution, elevators, and plumbing.

### 3. Basement Parking Control (`parking_operator`)
- Digital check-in/check-out terminal with Bangladeshi vehicle registration presets (`Dhaka Metro-Ga-XX-XXXX`, etc.).
- Automated hourly tariff calculation in BDT:
  - Motorcycle (Bike): ৳30 for first 2 hrs + ৳10/hr
  - Private Car: ৳100 for first 2 hrs + ৳50/hr
  - SUV / 4x4: ৳120 for first 2 hrs + ৳60/hr
  - Lost Token Fine: ৳500 standard penalty
- Live basement occupancy counter by zone.

---

## 🔑 Official Super Admin Credentials

- **Email**: `admin@totalofficecenter.com`
- **Password**: `Admin@1234`
- **Role**: `super_admin`

---

## 🚀 Quick Start

1. Start Apache & MySQL in **XAMPP Control Panel**.
2. Run database migration and seed:
   ```bash
   mysql -u root smart_mall_db < backend/database/schema_and_seed.sql
   ```
3. Launch both services with one click:
   - Double-click **`start-all.bat`**
   - Backend: `http://localhost:8000`
   - Frontend: `http://localhost:5173`
