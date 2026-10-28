# 🧾 SC588 Bluetooth Thermal Billing Mobile App

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-0.74.5-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React Native" />
  <img src="https://img.shields.io/badge/Expo_SDK-51.0-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo SDK" />
  <img src="https://img.shields.io/badge/TypeScript-5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Android-14_Ready-3DDC84?style=for-the-badge&logo=android&logoColor=white" alt="Android 14" />
  <img src="https://img.shields.io/badge/ESC%2FPOS-58mm_(32_Cols)-FF6B6B?style=for-the-badge" alt="58mm ESC/POS" />
  <img src="https://img.shields.io/badge/EAS_Build-Passing-4CD964?style=for-the-badge&logo=expo" alt="EAS Build" />
</p>

A high-performance, lightweight mobile billing and thermal receipt print engine built for portable **58mm (2-inch) ESC/POS Bluetooth Thermal Printers** (such as **SC588**, **POS-58**, **MTP-II**).

Engineered in **TypeScript** and **React Native / Expo**, specifically tuned and tested for **Samsung Galaxy A34 5G (Android 14 / One UI 6)** and verified with real physical thermal printing.

---

## 📱 Hardware & Field-Tested Verification

| Specification | Hardware Detail |
| :--- | :--- |
| **Target Printer** | SC588 Portable Thermal Printer (58mm / 2-inch roll width) |
| **Communication Profile** | Bluetooth Classic RFCOMM (Serial Port Profile - SPP) |
| **Grid Boundary** | Strict 32 characters per line limit (`LINE_WIDTH = 32`) |
| **Test Device** | Samsung Galaxy A34 5G (Android 14, API Level 34) |
| **Validation Status** | **VERIFIED & WORKING** on physical hardware |

---

## 📸 Real Printed Receipt Sample

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

## ✨ Key Features & Architecture

### 1. ⚡ Dual-Mode Universal Architecture
- **In Expo Go & Web:** Automatically activates a non-mutating mock driver layer (`services/bluetoothPrinter.ts`), allowing instant UI preview, layout tweaking, and button testing without crashing the Hermes engine.
- **In Standalone APK:** Automatically binds directly to native Android Bluetooth RFCOMM hardware APIs to dispatch raw ESC/POS byte streams to physical printers.

### 2. 📏 Mathematical 32-Column Grid Budget
Standard 58mm thermal printers wrap awkwardly if a line exceeds 32 characters. Our layout allocates strict character column limits:
- `#` (3 chars) + `Name` (11 chars) + `Qty` (5 chars) + `Pri` (6 chars) + `Amt` (7 chars) = **Exactly 32 Characters**.
- Summary line: `Label` (20 chars) + `Value` (12 chars) = **32 Characters**.

### 3. 🛡️ Android 14 Runtime Security & Permissions
- Automatically checks `Platform.Version >= 31` and prompts for modern Android permissions:
  - `android.permission.BLUETOOTH_CONNECT`
  - `android.permission.BLUETOOTH_SCAN`
  - `android.permission.ACCESS_FINE_LOCATION`
- Configured with `minSdkVersion: 31` via `expo-build-properties`.

### 4. 🔍 Auto-Discovery & Manual Selection Fallback
- Scans both bonded (paired) and nearby unbonded devices.
- Auto-locks onto hardware matching `SC588`, `POS`, `PRINTER`, or `MTP`.
- If an unusual Bluetooth broadcast name is used, an interactive **"Select Your Printer"** sheet appears automatically for manual tap-to-connect.

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
├── App.tsx                     # Main UI controller & ESC/POS 32-col layout stream
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

## 🖨️ Client Field-Testing Quick Guide

When conducting a live demonstration with a physical thermal printer:

1. **Power On**: Turn on the printer (confirm green power LED is steady and 58mm paper roll is installed).
2. **First-Time Bluetooth Pairing**:
   - Open your phone's **Settings > Bluetooth**.
   - Tap the printer and pair using PIN `0000` or `1234`.
3. **Open Billing App**:
   - Tap **"1. Locate & Bind Printer"** &rarr; Status indicator turns **Green**.
   - Tap **"2. Push Blueprint Receipt"** &rarr; Receipt feeds and prints instantly!

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
