# 🧾 Dual-Engine Thermal POS Billing Mobile App

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-0.74.5-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React Native" />
  <img src="https://img.shields.io/badge/Expo_SDK-51.0-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo SDK" />
  <img src="https://img.shields.io/badge/TypeScript-5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Android-14_Ready-3DDC84?style=for-the-badge&logo=android&logoColor=white" alt="Android 14" />
  <img src="https://img.shields.io/badge/Printers-SC588_(58mm)_%26_EZO_80UB_(80mm)-FF6B6B?style=for-the-badge" alt="SC588 & EZO 80UB" />
  <img src="https://img.shields.io/badge/EAS_Build-Passing-4CD964?style=for-the-badge&logo=expo" alt="EAS Build" />
</p>

A high-performance, lightweight mobile billing and thermal receipt print engine built for both **portable 58mm (2-inch)** and **desktop-class 80mm (3-inch)** Bluetooth ESC/POS printers.

Engineered in **TypeScript** and **React Native / Expo**, specifically tuned and tested on **Samsung Galaxy A34 5G (Android 14 / One UI 6)** and verified with real physical thermal printing.

---

## 🖨️ Supported Hardware Profiles

The app features a **one-tap hardware switcher** and **intelligent Bluetooth auto-detection** to seamlessly format receipts for both machine classes:

| Feature / Metric | 📱 SC588 Profile | 🏢 EZO 80UB Profile |
| :--- | :--- | :--- |
| **Hardware Class** | Portable Handheld 2-Inch Printer | Desktop-Grade 3-Inch POS Printer |
| **Paper Width** | 58mm Thermal Roll | 80mm Thermal Roll |
| **Line Character Limit** | **32 characters** per line | **48 characters** per line |
| **Item Name Width** | 11 characters | **20 characters** (extended detail) |
| **Cutting Mechanism** | Manual Tear Bar (extra feed lines) | **⚡ Native Motorized Auto-Cutter** (`GS V 0`) |
| **Auto-Detect Keywords** | `SC588`, `POS-58`, `POS58`, `MTP` | `80UB`, `EZO`, `POS-80`, `POS80`, `80MM` |
| **Physical Verification** | **VERIFIED & WORKING** | **Supported** |

---

## 📸 Real Printed Receipt Sample (SC588 58mm Mode)

```text
================================
          Aftab Rental
--------------------------------
Date: 26/10/2026
Invoice No: 38
--------------------------------
#   Name          Qty   Pri  Amt
--------------------------------
1   CHANACHUR       2    90  180
2   S N T RICE      2    40   80
3   SUN R MIRC    0.4   490  196
4   POTATO F       50    17  850
5   BHUJIA-700      4    65  260
6   SUJI            1    45   45
7   LONG-        0.05  1500   75
8   MAIDA           1  1880 1880
9   PLAM OIL 1      1  2190 2190
10  ONION           1    55   55
11  L C             1    15   15
--------------------------------
Total Items/Qty:           63.45
Total Amount:    5826
================================
```

---

## 🧾 EZO 80UB 48-Column Receipt Layout (80mm Mode)

```text
================================================
                  Aftab Rental
------------------------------------------------
Date: 26/10/2026
Invoice No: 38
------------------------------------------------
#    Item Description       Qty    Price    Amount
------------------------------------------------
1    CHANACHUR                2    90.00    180.00
2    S N T RICE               2    40.00     80.00
3    SUN R MIRC             0.4   490.00    196.00
4    POTATO F                50    17.00    850.00
5    BHUJIA-700               4    65.00    260.00
6    SUJI                     1    45.00     45.00
7    LONG-                 0.05  1500.00     75.00
8    MAIDA                    1  1880.00   1880.00
9    PLAM OIL 1               1  2190.00   2190.00
10   ONION                    1    55.00     55.00
11   L C                      1    15.00     15.00
------------------------------------------------
Total Items/Qty:                           63.45
Grand Total Amount:                      5826.00
------------------------------------------------
     - - - - - - - - ✂️ AUTO-CUT - - - - - - - -
```

---

## ✨ Key Features & Architecture

### 1. 🔄 Dynamic Dual-Engine Profile Switcher
- Instant toggle between **SC588 (58mm)** and **EZO 80UB (80mm)** right from the top control panel.
- Live Monospace Layout Preview dynamically shifts between **32-column** and **48-column** simulations.
- Automatically adjusts column width budgets, dividers, feed lengths, and cutter action.

### 2. ✂️ Motorized Auto-Cutter Integration
- **EZO 80UB** sends the ESC/POS hardware cutting command (`\x1D\x56\x00` - `GS V 0`) to actuate the motorized cutter blade automatically upon completion.
- Eliminates the need for pulling or manual tearing.

### 3. ⚡ Dual-Mode Universal Architecture
- **In Expo Go & Web:** Automatically activates a non-mutating mock driver layer (`services/bluetoothPrinter.ts`), allowing instant UI preview, layout tweaking, and button testing without crashing the Hermes engine.
- **In Standalone APK:** Automatically binds directly to native Android Bluetooth RFCOMM hardware APIs to dispatch raw ESC/POS byte streams to physical printers.

### 4. 🛡️ Android 14 Runtime Security & Permissions
- Automatically checks `Platform.Version >= 31` and prompts for modern Android permissions:
  - `android.permission.BLUETOOTH_CONNECT`
  - `android.permission.BLUETOOTH_SCAN`
  - `android.permission.ACCESS_FINE_LOCATION`
- Configured with `minSdkVersion: 31` via `expo-build-properties`.

### 5. 🛠️ Automated Gradle 8 & AndroidX Patching
- Legacy printer drivers often ship with outdated `http://jcenter.bintray.com/` URLs and `compile` directives.
- Our custom `scripts/patch-printer.js` automatically executes on `postinstall`, updating the driver to Gradle 8, HTTPS, and modern AndroidX before compilation.

---

## 🚀 Standalone APK Download

You can download and install the compiled APK directly on any Android smartphone:

📦 **[Download Direct APK (EAS Artifact)](https://expo.dev/artifacts/eas/x3ZQWSw1BM8LpqPxKwKQiQq4hRednkqdGytSE-J-MYk.apk)**

---

## 📁 Repository File Structure

```text
billing-mobile-app/
├── App.tsx                     # Main UI controller & dual 32/48-col ESC/POS stream
├── app.json                    # Expo config (permissions, package, splash, EAS ID)
├── eas.json                    # EAS Cloud Build configuration (APK profile)
├── index.js                    # Application entry point (registerRootComponent)
├── package.json                # Dependencies, build scripts & postinstall patch
├── tsconfig.json               # TypeScript configuration extending expo/tsconfig.base
├── .gitignore                  # Clean repository ignores (node_modules, .expo, etc.)
├── scripts/
│   └── patch-printer.js        # Gradle 8 & AndroidX build patcher
├── services/
│   └── bluetoothPrinter.ts     # Safe dual-mode native/mock Bluetooth driver
└── types/
    └── react-native-bluetooth-escpos-printer.d.ts # Strong TypeScript definitions
```

---

## 💻 Developer Setup & Commands

### 1. Install Dependencies
```bash
npm install
```
*(Automatically triggers `postinstall` to patch the printer module and execute `jetify`).*

### 2. Preview UI (Expo Go / Browser)
```bash
npm start
```
- Press `r` to reload the bundle.
- Press `w` to open interactive web preview in your browser.
- Scan QR with Expo Go on your mobile device.

### 3. Build Standalone Android APK (EAS)
```bash
npm run build:apk
```
Builds a production-ready, standalone `.apk` in the cloud via EAS Application Services.

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
