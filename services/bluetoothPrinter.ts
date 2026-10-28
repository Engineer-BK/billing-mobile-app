import { NativeModules } from 'react-native';

export interface BluetoothDevice {
  name?: string;
  address: string;
}

export interface DeviceListResponse {
  paired?: BluetoothDevice[];
  found?: BluetoothDevice[];
}

export interface PrintTextOptions {
  encoding?: string;
  codepage?: number;
  widthtimes?: number;
  heigthtimes?: number;
  fonttype?: number;
}

const ALIGN_CONSTANTS = {
  LEFT: 0,
  CENTER: 1,
  RIGHT: 2,
};

const ERROR_CORRECTION_CONSTANTS = {
  L: 1,
  M: 0,
  Q: 3,
  H: 2,
};

const BARCODETYPE_CONSTANTS = {
  UPC_A: 65,
  UPC_E: 66,
  JAN13: 67,
  JAN8: 68,
  CODE39: 69,
  ITF: 70,
  CODABAR: 71,
  CODE93: 72,
  CODE128: 73,
};

const ROTATION_CONSTANTS = {
  OFF: 0,
  ON: 1,
};

const nativeManager = NativeModules.BluetoothManager;
const nativeEscpos = NativeModules.BluetoothEscposPrinter;

export const isNativeHardwareAvailable = Boolean(nativeManager && nativeEscpos);

export const BluetoothManager = {
  EVENT_DEVICE_ALREADY_PAIRED: 'EVENT_DEVICE_ALREADY_PAIRED',
  EVENT_DEVICE_FOUND: 'EVENT_DEVICE_FOUND',
  EVENT_DEVICE_DISCOVER_DONE: 'EVENT_DEVICE_DISCOVER_DONE',
  EVENT_CONNECTION_LOST: 'EVENT_CONNECTION_LOST',
  EVENT_UNABLE_CONNECT: 'EVENT_UNABLE_CONNECT',
  EVENT_CONNECTED: 'EVENT_CONNECTED',
  EVENT_BLUETOOTH_NOT_SUPPORT: 'EVENT_BLUETOOTH_NOT_SUPPORT',

  isBluetoothEnabled: async (): Promise<boolean> => {
    if (isNativeHardwareAvailable && nativeManager?.isBluetoothEnabled) {
      return nativeManager.isBluetoothEnabled();
    }
    return true;
  },

  enableBluetooth: async (): Promise<string[]> => {
    if (isNativeHardwareAvailable && nativeManager?.enableBluetooth) {
      return nativeManager.enableBluetooth();
    }
    return [];
  },

  scanDevices: async (): Promise<string | DeviceListResponse> => {
    if (isNativeHardwareAvailable && nativeManager?.scanDevices) {
      return nativeManager.scanDevices();
    }
    return JSON.stringify({
      paired: [
        { name: 'EZO 80UB 3Inch Printer (Demo)', address: '80:UB:20:25:04:02' },
        { name: 'SC588 Thermal Printer (Demo)', address: '86:67:7A:B2:11:01' },
        { name: 'POS-58 Bluetooth (Demo)', address: '66:32:9A:12:44:88' },
      ],
      found: [],
    });
  },

  connect: async (address: string): Promise<string> => {
    if (isNativeHardwareAvailable && nativeManager?.connect) {
      return nativeManager.connect(address);
    }
    console.log(`[Expo Go Mock] Connected to virtual device at ${address}`);
    return address;
  },

  disconnect: async (address: string): Promise<void> => {
    if (isNativeHardwareAvailable && nativeManager?.disconnect) {
      return nativeManager.disconnect(address);
    }
    console.log(`[Expo Go Mock] Disconnected from virtual device ${address}`);
  },
};

export const BluetoothEscposPrinter = {
  ALIGN: ALIGN_CONSTANTS,
  ERROR_CORRECTION: ERROR_CORRECTION_CONSTANTS,
  BARCODETYPE: BARCODETYPE_CONSTANTS,
  ROTATION: ROTATION_CONSTANTS,

  printerInit: async (): Promise<void> => {
    if (isNativeHardwareAvailable && nativeEscpos?.printerInit) {
      return nativeEscpos.printerInit();
    }
  },

  printerLeftSpace: async (space: number): Promise<void> => {
    if (isNativeHardwareAvailable && nativeEscpos?.printerLeftSpace) {
      return nativeEscpos.printerLeftSpace(space);
    }
  },

  printerAlign: async (align: number): Promise<void> => {
    if (isNativeHardwareAvailable && nativeEscpos?.printerAlign) {
      return nativeEscpos.printerAlign(align);
    }
  },

  printText: async (text: string, options?: PrintTextOptions): Promise<void> => {
    if (isNativeHardwareAvailable && nativeEscpos?.printText) {
      return nativeEscpos.printText(text, options);
    }
    console.log('[Expo Go Mock Print Stream]:', text);
  },

  printColumn: async (
    columnWidths: number[],
    columnAligns: number[],
    columnTexts: string[],
    options?: Record<string, unknown>
  ): Promise<void> => {
    if (isNativeHardwareAvailable && nativeEscpos?.printColumn) {
      return nativeEscpos.printColumn(columnWidths, columnAligns, columnTexts, options);
    }
    console.log('[Expo Go Mock Print Column]:', columnTexts.join(' | '));
  },
};
