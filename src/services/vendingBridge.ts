export interface AndroidVendingBridge {
  dispense: (row: number, col: number) => void;
  configureSerial?: (port: string, baudRate: number) => void;
  getSerialStatus?: () => string;
}

declare global {
  interface Window {
    AndroidVending?: AndroidVendingBridge;
  }
}

export interface DispenseDispatchResult {
  nativeBridgeDetected: boolean;
  row: number;
  col: number;
  dispatchedAt: string;
}

export function isAndroidKioskHardware(): boolean {
  return typeof window !== 'undefined' && typeof window.AndroidVending?.dispense === 'function';
}

export function triggerPhysicalMotor(row: number, col: number): DispenseDispatchResult {
  const nativeBridgeDetected = isAndroidKioskHardware();

  if (nativeBridgeDetected) {
    try {
      window.AndroidVending?.dispense(row, col);
    } catch (err) {
      console.error('[AndroidVending] Serial dispense error:', err);
    }
  } else {
    console.info(`[Browser Preview] window.AndroidVending?.dispense(${row}, ${col})`);
  }

  return {
    nativeBridgeDetected,
    row,
    col,
    dispatchedAt: new Date().toISOString(),
  };
}
