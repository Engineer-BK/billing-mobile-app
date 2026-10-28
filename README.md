# SC588 Bluetooth Thermal Billing MVP (Expo + TypeScript)

A lightweight diagnostic tool and billing print engine for the **SC588 58mm (2-inch) Bluetooth Thermal Printer**, configured for **Expo Development Builds**, **EAS Build (APK)**, and tested on the **Samsung Galaxy A34 5G**.

---

## ⚠️ Critical Expo Architecture Notice
Because `react-native-bluetooth-escpos-printer` communicates directly with Android native Bluetooth hardware (Classic RFCOMM profile), **this app CANNOT run inside standard Expo Go**. Launching it in Expo Go will crash when accessing native Bluetooth modules.

You must run either:
1. **Expo Development Build** (`npx expo run:android`) via USB cable.
2. **Standalone APK** via EAS Cloud (`eas build --platform android --profile preview`).

---

## 📁 Project Structure

```text
billing-mobile-app/
├── App.tsx                     # Main controller in TypeScript with 32-col print stream
├── app.json                    # Expo config with Bluetooth permissions & minSdkVersion 31
├── eas.json                    # EAS build profiles (internal dev build & preview APK)
├── index.js                    # Expo entry registration (registerRootComponent)
├── package.json                # Expo SDK 51, TypeScript, Jetifier postinstall
├── tsconfig.json               # TypeScript strict configuration
├── types/
│   └── react-native-bluetooth-escpos-printer.d.ts  # Type declarations for native module
└── README.md
```

---

## 🛠️ Step 1: Install Dependencies

Open PowerShell in this directory:
```bash
npm install
```
*(The `postinstall` script automatically executes `jetify` to patch legacy Android support libraries for modern AndroidX).*

---

## 💻 Step 2: Local Testing on Samsung Galaxy A34 5G (Expo Dev Build)

### 1. Enable Developer Mode on Samsung Galaxy A34 5G:
1. Open **Settings** > **About phone** > **Software information**.
2. Tap **Build number** 7 times until you see *"Developer mode has been enabled"*.
3. Go back to **Settings** > **Developer options**.
4. Enable **USB debugging**.

### 2. Connect Device & Compile:
1. Connect your Samsung A34 5G to your computer via USB.
2. Allow USB debugging prompt on phone screen when prompted.
3. Run the development build:
```bash
npx expo run:android
```
This builds and installs the custom development client onto your Samsung phone with live hot-reloading.

---

## 📦 Step 3: Cloud Compiling Standalone APK (EAS Build)

If you want a standalone `.apk` that installs without needing a local Android development environment or USB cable:

1. Install EAS CLI globally:
```bash
npm install -g eas-cli
```
2. Log into your Expo account:
```bash
eas login
```
3. Run the cloud build:
```bash
eas build --platform android --profile preview
```
4. Once completed, EAS will display a **QR code / direct download link**.
5. Open your Samsung camera or browser, download the `.apk`, and install it.

---

## 🔌 Step 4: Samsung One UI Specific Configuration

Samsung's One UI battery and privacy engines require two manual checks:
1. **Nearby Devices Permission**:
   * Long-press the installed app icon > **App info** (ℹ️) > **Permissions**.
   * Ensure **Nearby devices** is set to **Allow**.
2. **Prevent Connection Dropping (Battery Optimization)**:
   * Inside **App info** > **Battery**, select **Unrestricted**.
   * This prevents Samsung's power manager from killing the Bluetooth socket when the screen locks.

---

## 🧾 58mm Receipt Character Allocation (32 Columns)

| Field | Width | Align | Preview |
|---|:---:|:---:|---|
| Serial (`#`) | 3 | Left | `1  ` |
| Item Name (`Name`) | 11 | Left | `CHANACHUR  ` |
| Quantity (`Qty`) | 5 | Right | `    2` |
| Price (`Pri`) | 6 | Right | `    90` |
| Amount (`Amt`) | 7 | Right | `    180` |
| **Total Line Width** | **32** | | Fits 58mm roll with zero overflow |
| Total Items / Qty | 20 / 12 | Left / Right | `"Total Items/Qty:              63.45"` |
| Total Amount (Bold) | 20 / 12 | Left / Right | `"Total Amount:                  5826"` |

---

## 🧪 Hardware Printing Execution

1. Power on the SC588 printer (solid green light).
2. Pair the printer in Samsung phone **Settings > Bluetooth** (PIN `0000` or `1234`).
3. Open the app:
   * Tap **1. Locate & Bind Printer** (grants permissions and locks onto the SC588).
   * Tap **2. Push Blueprint Receipt** to print the receipt.
