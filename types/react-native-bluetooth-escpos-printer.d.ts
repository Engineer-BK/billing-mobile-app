declare module 'react-native-bluetooth-escpos-printer' {
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

  export namespace BluetoothManager {
    export function isBluetoothEnabled(): Promise<boolean>;
    export function enableBluetooth(): Promise<string[]>;
    export function scanDevices(): Promise<string | DeviceListResponse>;
    export function connect(address: string): Promise<string>;
    export function disconnect(address: string): Promise<void>;

    export const EVENT_DEVICE_ALREADY_PAIRED: string;
    export const EVENT_DEVICE_FOUND: string;
    export const EVENT_DEVICE_DISCOVER_DONE: string;
    export const EVENT_CONNECTION_LOST: string;
    export const EVENT_UNABLE_CONNECT: string;
    export const EVENT_CONNECTED: string;
    export const EVENT_BLUETOOTH_NOT_SUPPORT: string;
  }

  export namespace BluetoothEscposPrinter {
    export const ALIGN: {
      LEFT: number;
      CENTER: number;
      RIGHT: number;
    };

    export const ERROR_CORRECTION: {
      L: number;
      M: number;
      Q: number;
      H: number;
    };

    export const BARCODETYPE: {
      UPC_A: number;
      UPC_E: number;
      JAN13: number;
      JAN8: number;
      CODE39: number;
      ITF: number;
      CODABAR: number;
      CODE93: number;
      CODE128: number;
    };

    export const ROTATION: {
      OFF: number;
      ON: number;
    };

    export function printerInit(): Promise<void>;
    export function printerLeftSpace(space: number): Promise<void>;
    export function printerAlign(align: number): Promise<void>;
    export function printText(text: string, options?: PrintTextOptions): Promise<void>;
    export function printColumn(
      columnWidths: number[],
      columnAligns: number[],
      columnTexts: string[],
      options?: Record<string, unknown>
    ): Promise<void>;
  }

  export namespace BluetoothTscPrinter {
    export const DIRECTION: {
      FORWARD: number;
      BACKWARD: number;
    };
    export const DENSITY: Record<string, number>;
    export const BARCODETYPE: Record<string, string>;
    export const FONTTYPE: Record<string, string>;
  }
}
