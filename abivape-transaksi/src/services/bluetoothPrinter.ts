export interface BluetoothPrinterConfig {
  serviceUUID: string;
  characteristicUUID: string;
}

const encoder = new TextEncoder();

const escPosInit = new Uint8Array([0x1b, 0x40]);
const escPosCut = new Uint8Array([0x1d, 0x56, 0x42, 0x00]);

export class BluetoothPrinter {
  private device: BluetoothDevice | null = null;
  private characteristic: BluetoothRemoteGATTCharacteristic | null = null;

  async connect(config: BluetoothPrinterConfig): Promise<string> {
    if (!navigator.bluetooth) {
      throw new Error("Browser tidak mendukung Web Bluetooth");
    }

    this.device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: [config.serviceUUID],
    });

    const server = await this.device.gatt?.connect();
    if (!server) {
      throw new Error("Gagal konek ke printer Bluetooth");
    }

    const service = await server.getPrimaryService(config.serviceUUID);
    this.characteristic = await service.getCharacteristic(config.characteristicUUID);

    return this.device.name || "Bluetooth Printer";
  }

  isConnected(): boolean {
    return Boolean(this.device?.gatt?.connected && this.characteristic);
  }

  async printText(text: string): Promise<void> {
    if (!this.characteristic) {
      throw new Error("Printer belum terhubung");
    }

    const body = encoder.encode(`${text}\n\n\n`);
    const merged = new Uint8Array(escPosInit.length + body.length + escPosCut.length);
    merged.set(escPosInit, 0);
    merged.set(body, escPosInit.length);
    merged.set(escPosCut, escPosInit.length + body.length);

    const chunkSize = 180;
    for (let i = 0; i < merged.length; i += chunkSize) {
      const chunk = merged.slice(i, i + chunkSize);
      await this.characteristic.writeValue(chunk);
    }
  }
}
