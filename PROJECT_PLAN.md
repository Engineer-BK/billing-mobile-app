# 3-Module POS Billing & Printing Master Plan

This master plan divides the entire project enhancement into **three clean, modular, and readable phases**. All complex logic is fully documented with developer-friendly comments so anyone can easily read, modify, and maintain the codebase.

---

## 🏛️ MODULE 1: Architecture, Code Splitting & Hardware Calibration

### 1.1 Why `scripts/patch-printer.js` MUST Remain JavaScript (`.js`)
* In [package.json](file:///f:/WsCube%20Node.js/DEVELOPMENT/billing-mobile-app/package.json), line 12: `"postinstall": "node scripts/patch-printer.js && jetify"`.
* When EAS Build compiles your APK on cloud Linux servers, it runs `npm install`. Npm executes `"postinstall"` with raw `node`.
* Standard Node.js does not understand `.ts` files without a transpiler. Renaming to `.ts` would cause `npm install` and the entire EAS build to crash before Gradle starts.
* **Decision:** Keep `scripts/patch-printer.js` as clean, reliable CommonJS (`.js`).

### 1.2 Top vs. Bottom Receipt Margin Equalization
* **Physical Cause:** The thermal printhead is physically located **25mm–30mm behind the auto-cutter blade**. Because POS paper only feeds forward, the top margin from the cut edge to the first line of text is a fixed physical constant for **every receipt**.
* **Equalization Strategy:** We calibrate the bottom feed to **7–8 blank lines** ($\approx 26-28\text{mm}$). This ensures that the bottom space below the closing divider matches the physical top margin symmetrically.

### 1.3 Modular Folder Structure (De-bloating `App.tsx`)
Currently, `App.tsx` has over 1,140 lines. We split it into single-responsibility, highly readable files:

```text
billing-mobile-app/
├── constants/
│   ├── items.ts               # Grocery catalog (23 categories, 150+ products)
│   ├── receipt.ts             # Receipt data types & default fallback receipt
│   ├── printers.ts            # SC588 & EZO80 printer hardware profiles
│   └── theme.ts               # Retail branding palette (Colors & GlobalStyles)
│
├── context/
│   └── ThemeContext.tsx       # Theme provider with instant Dark/Light mode toggling
│
├── types/
│   ├── printer.ts             # TypeScript definitions for profiles & Bluetooth devices
│   └── billing.ts             # Data models for Customer, Cart Items & Invoice
│
├── services/
│   ├── bluetoothPrinter.ts    # Native Bluetooth module wrapper & Hermes shims
│   └── printJobService.ts     # Pure function to format & dispatch ESC/POS print jobs
│
├── hooks/
│   ├── useTheme.ts            # Quick hook for active theme colors
│   └── useBluetoothScanner.ts # Permissions, Bluetooth scan, bind, & disconnect logic
│
├── components/
│   ├── HeaderBar.tsx          # Top app bar with Dark/Light theme toggle
│   ├── ProfileSwitcher.tsx    # 58mm vs 80mm hardware profile selector
│   ├── DeviceStatusCard.tsx   # Connected MAC badge & disconnect button
│   ├── DevicePickerSheet.tsx  # Discovered Bluetooth devices list modal
│   ├── BillingForm/           # Interactive POS billing form (Module 3)
│   │   ├── BillingForm.tsx    # Main billing form container
│   │   ├── ItemSelector.tsx   # Dropdown autocomplete + custom manual item entry
│   │   └── CartTable.tsx      # Dynamic items list with delete & live row calculations
│   └── ReceiptPreview/
│       ├── ReceiptPreview.tsx # On-screen live preview card
│       ├── DashedDivider.tsx  # Reusable edge-to-edge clipped dashed line
│       └── ReceiptTable.tsx   # Proportional flex columns table
│
├── App.tsx                    # Clean coordinator screen (~150 lines)
├── app.json
└── package.json
```

---

## 🎨 MODULE 2: High-Speed Retail Design System & Dark/Light Mode

### 2.1 Retail Branding Palette Integration (`constants/theme.ts`)
We bind your high-speed retail color scheme across the entire UI:

* **Primary (`#F97316` - Safety Orange):** Primary CTAs, Generate Bill button, active tabs.
* **Secondary (`#6366F1` - Indigo Purple):** Secondary actions, hardware profile badges.
* **Success (`#22C55E` - Emerald Green):** "Push Print" button, Bluetooth connected state.
* **Error (`#EF4444` - Warning Red):** Disconnect button, delete item, out-of-stock badge.

### 2.2 Dual Theme Configuration:
* **Dark Theme (Default):**
  * Canvas Background: `#09090B` (Jet Pitch Black)
  * Card Surfaces: `#18181B` (Dark Zinc)
  * Borders: `#27272A`
  * Typography: `#FAFAFA` (Crisp White) / `#A1A1AA` (Slate Gray)
* **Light Theme:**
  * Canvas Background: `#F4F4F5` (Clean Light Zinc Canvas)
  * Card Surfaces: `#FFFFFF` (Pure White)
  * Borders: `#E4E4E7`
  * Typography: `#09090B` (Deep Near-Black) / `#71717A` (Muted Zinc)

### 2.3 Instant 1-Tap Toggle & Realism:
* Header bar features a ☀️ / 🌙 theme switch button.
* Automatically flips `StatusBar` between `light-content` and `dark-content`.
* **Thermal Paper Realism:** While the app shell switches between dark and light, the **on-screen receipt preview** preserves authentic thermal receipt paper cream styling (`#FFFDF0`), ensuring true-to-life physical preview in both modes.

---

## 🧾 MODULE 3: Dynamic POS Billing Form & Automatic Invoice Engine

### 3.1 Real-Time Dynamic Date & Time Detection
* **Never Hardcoded:** When the app loads or generates a bill, it queries the device clock via JavaScript `new Date()`.
* Formatted automatically into standard POS timestamps:
  * **Date:** `DD/MM/YYYY` (e.g., `29/10/2026`)
  * **Time:** `hh:mm A` (e.g., `05:25 PM`)
* Auto-generated, sequential Invoice Number (e.g., `#1001`, `#1002`, or based on timestamp).

### 3.2 Interactive Billing Form Fields
The POS Form will include:
1. **Customer Name Input:**
   * Text field for customer name (or defaults to `"Walk-in Customer"`).
2. **Smart Product Selector (Dropdown + Manual Input):**
   * **Dropdown / Autocomplete:** Tap to choose from the 150+ products in [`constants/items.ts`](file:///f:/WsCube%20Node.js/DEVELOPMENT/billing-mobile-app/constants/items.ts) (e.g. *Basmati Rice*, *Mustard Oil*, *Chanachur*).
   * **Custom Item Entry:** If an item is not in the dropdown catalog, user can type any custom name.
3. **Quantity & Unit Price:**
   * Selecting a product automatically fills its unit price (e.g., `₹90`).
   * User can modify price if giving a custom rate.
   * Quantity supports both integers and decimals (e.g. `2` packets, `0.5` kg, `1.25` kg).
4. **Automatic Line Calculation:**
   $$\text{Item Amount} = \text{Quantity} \times \text{Unit Price}$$
   *(Updates in real-time as the user types).*
5. **Add Item to Bill:**
   * "Add Item" button adds the item into a dynamic cart list with an instant "Delete" button.

### 3.3 Discount & Grand Totals Engine
* **Discount (%) Input:**
   * Optional field for discount percentage (e.g., `5%`, `10%`).
* **Live Calculations:**
  $$\text{Subtotal} = \sum (\text{Qty} \times \text{Price})$$
  $$\text{Discount Amount} = \text{Subtotal} \times \left(\frac{\text{Discount \%}}{100}\right)$$
  $$\text{Grand Total} = \text{Subtotal} - \text{Discount Amount}$$
  $$\text{Total Items Count} = \text{Count of unique rows}$$
  $$\text{Total Quantity} = \sum \text{Qty}$$

### 3.4 "Generate Bill" & "Print Receipt" Flow
1. **Tap "Generate Bill" (Safety Orange Button):**
   * Validates cart has at least 1 item.
   * Formats the invoice payload with live date, time, customer name, line items, discount, and grand totals.
   * Updates the on-screen receipt preview card immediately with the new bill!
2. **Tap "Push Print" (Emerald Green Button):**
   * Dispatches the newly generated bill directly to the linked thermal printer (SC588 58mm or EZO 80UB 80mm).
   * Automatically executes the 7–8 line feed and triggers auto-cut!

---

## 📋 Implementation Order

1. **Step 1:** Implement Module 1 & 2 foundations (Types, Theme Context, Modular constants and hooks).
2. **Step 2:** Refactor the Receipt Preview & Switcher into components (`components/ReceiptPreview/`, `components/ProfileSwitcher.tsx`).
3. **Step 3:** Implement Module 3 (Billing Form, Item Dropdown from `items.ts`, Discount %, live calculations).
4. **Step 4:** Connect the Form to the live Preview and Print engine in a clean, readable `App.tsx`.
5. **Step 5:** Validate TypeScript (`npx tsc --noEmit`) and verify hot-reload in Expo Go.
