import { useMemo, useRef, useState } from "react";
import { saveTransaction } from "./services/api";
import {
  buildReceiptText,
  downloadReceiptAsTxt,
} from "./services/receipt";
import {
  BluetoothPrinter,
  type BluetoothPrinterConfig,
} from "./services/bluetoothPrinter";
import type { TransactionInput, TransactionItemInput } from "./types/transaction";

const printer = new BluetoothPrinter();

const toRupiah = (value: number): string =>
  new Intl.NumberFormat("id-ID").format(value || 0);

const today = (): string => new Date().toISOString().slice(0, 10);

const initialItem = (): TransactionItemInput => ({
  kode_barang: "",
  kode_barcode: "",
  nama_barang: "",
  kode_kategori: "",
  kode_jenis: "",
  kode_merk: "",
  kode_varian: "",
  satuan: "pcs",
  qty: 1,
  harga_jual: 0,
  disc_persen: 0,
  disc_rp: 0,
  no_promo: "",
  deskripsi_promo: "",
  serial_number: "",
});

function App() {
  const [apiBaseUrl, setApiBaseUrl] = useState(
    localStorage.getItem("trx_api_base_url") || "http://localhost:3100/v1",
  );
  const [token, setToken] = useState(localStorage.getItem("trx_api_token") || "");
  const [storeName, setStoreName] = useState(
    localStorage.getItem("trx_store_name") || "ABIVAPE",
  );

  const [serviceUUID, setServiceUUID] = useState(
    localStorage.getItem("bt_service_uuid") || "000018f0-0000-1000-8000-00805f9b34fb",
  );
  const [characteristicUUID, setCharacteristicUUID] = useState(
    localStorage.getItem("bt_char_uuid") || "00002af1-0000-1000-8000-00805f9b34fb",
  );

  const [tglJual, setTglJual] = useState(today());
  const [kodeSales, setKodeSales] = useState("");
  const [namaCustomer, setNamaCustomer] = useState("REG");
  const [noHp, setNoHp] = useState("-");
  const [alamatCustomer, setAlamatCustomer] = useState("-");
  const [cashNominal, setCashNominal] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<
    "CASH" | "TRANSFER" | "QRIS" | "CARD"
  >("CASH");
  const [paymentReference, setPaymentReference] = useState("");
  const [items, setItems] = useState<TransactionItemInput[]>([initialItem()]);

  const [printerName, setPrinterName] = useState("Belum terkoneksi");
  const [status, setStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [lastReceipt, setLastReceipt] = useState("");

  const formRef = useRef<HTMLDivElement | null>(null);

  const totals = useMemo(() => {
    const gross = items.reduce(
      (sum, item) => sum + Number(item.qty || 0) * Number(item.harga_jual || 0),
      0,
    );
    const disc = items.reduce((sum, item) => sum + Number(item.disc_rp || 0), 0);
    const net = gross - disc;
    return { gross, disc, net };
  }, [items]);

  const setAndPersist = (key: string, value: string, setter: (v: string) => void) => {
    setter(value);
    localStorage.setItem(key, value);
  };

  const updateItem = (index: number, patch: Partial<TransactionItemInput>) => {
    setItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, ...patch } : item)),
    );
  };

  const addItem = () => setItems((prev) => [...prev, initialItem()]);
  const removeItem = (index: number) =>
    setItems((prev) => prev.filter((_, idx) => idx !== index));

  const connectPrinter = async () => {
    try {
      setStatus("Menyambungkan printer bluetooth...");
      const config: BluetoothPrinterConfig = {
        serviceUUID,
        characteristicUUID,
      };
      const name = await printer.connect(config);
      setPrinterName(name);
      setStatus(`Printer terhubung: ${name}`);
      localStorage.setItem("bt_service_uuid", serviceUUID);
      localStorage.setItem("bt_char_uuid", characteristicUUID);
    } catch (error: any) {
      setStatus(`Gagal connect printer: ${error?.message || String(error)}`);
    }
  };

  const buildPayload = (): TransactionInput => {
    const cleanedItems = items
      .filter((item) => item.kode_barang && item.nama_barang && item.qty > 0)
      .map((item) => ({
        kode_barang: item.kode_barang,
        kode_barcode: item.kode_barcode || item.kode_barang,
        nama_barang: item.nama_barang,
        kode_kategori: item.kode_kategori || "UMUM",
        kode_jenis: item.kode_jenis || "UMUM",
        kode_merk: item.kode_merk || "UMUM",
        kode_varian: item.kode_varian || "UMUM",
        satuan: item.satuan || "pcs",
        qty: Number(item.qty || 0),
        harga_jual: Number(item.harga_jual || 0),
        disc_persen: Number(item.disc_persen || 0),
        disc_rp: Number(item.disc_rp || 0),
        no_promo: item.no_promo || undefined,
        deskripsi_promo: item.deskripsi_promo || undefined,
        serial_number: item.serial_number || undefined,
      }));

    const computedNet = cleanedItems.reduce(
      (sum, item) =>
        sum + Number(item.qty || 0) * (Number(item.harga_jual || 0) - Number(item.disc_rp || 0)),
      0,
    );
    const payNominal = Number(cashNominal || computedNet || totals.net);

    const payment: TransactionInput["pembayaran"][number] = {
      metode: paymentMethod,
      jumlah: payNominal,
      referensi: paymentReference || undefined,
    };

    return {
      tgl_jual: new Date(`${tglJual}T00:00:00`).toISOString(),
      kode_sales: kodeSales,
      nama_customer: namaCustomer || "REG",
      no_hp: noHp || "-",
      alamat_customer: alamatCustomer || "-",
      items: cleanedItems,
      pembayaran: [payment],
    };
  };

  const saveAndPrint = async () => {
    try {
      setIsSaving(true);
      setStatus("Menyimpan transaksi...");

      const payload = buildPayload();
      if (!payload.kode_sales) {
        throw new Error("Kode sales wajib diisi");
      }
      if (payload.items.length === 0) {
        throw new Error("Minimal 1 item transaksi");
      }

      localStorage.setItem("trx_api_base_url", apiBaseUrl);
      localStorage.setItem("trx_api_token", token);
      localStorage.setItem("trx_store_name", storeName);

      let responseData;
      try {
        responseData = await saveTransaction(apiBaseUrl, token, payload);
      } catch (apiError: any) {
        throw new Error(
          `Gagal simpan ke API: ${apiError?.response?.data?.message || apiError?.message || "Unknown error"}`,
        );
      }

      const receipt = buildReceiptText(payload, responseData, storeName);
      setLastReceipt(receipt);

      if (!printer.isConnected()) {
        downloadReceiptAsTxt(receipt);
        setStatus(
          "Transaksi tersimpan. Printer belum connect, nota diunduh sebagai autoprint_lm.txt",
        );
        return;
      }

      try {
        await printer.printText(receipt);
        setStatus("Transaksi tersimpan dan nota berhasil dicetak via Bluetooth");
      } catch (printError: any) {
        downloadReceiptAsTxt(receipt);
        setStatus(
          `Transaksi tersimpan, tapi print Bluetooth gagal (${printError?.message || String(printError)}). Nota diunduh sebagai autoprint_lm.txt`,
        );
      }
    } catch (error: any) {
      setStatus(error?.message || "Terjadi error");
    } finally {
      setIsSaving(false);
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="app" ref={formRef}>
      <header>
        <h1>Transaksi Bluetooth</h1>
        <p>Project terpisah untuk transaksi + cetak nota printer Bluetooth thermal</p>
      </header>

      <section className="card grid-3">
        <label>
          API Base URL (abivape-api)
          <input
            value={apiBaseUrl}
            onChange={(e) => setAndPersist("trx_api_base_url", e.target.value, setApiBaseUrl)}
            placeholder="http://localhost:3000/v1"
          />
        </label>
        <label>
          Bearer Token
          <input
            value={token}
            onChange={(e) => setAndPersist("trx_api_token", e.target.value, setToken)}
            placeholder="optional"
          />
        </label>
        <label>
          Nama Toko
          <input
            value={storeName}
            onChange={(e) => setAndPersist("trx_store_name", e.target.value, setStoreName)}
            placeholder="ABIVAPE"
          />
        </label>
      </section>

      <section className="card grid-3">
        <label>
          Service UUID
          <input
            value={serviceUUID}
            onChange={(e) => setServiceUUID(e.target.value)}
            placeholder="UUID service printer"
          />
        </label>
        <label>
          Characteristic UUID
          <input
            value={characteristicUUID}
            onChange={(e) => setCharacteristicUUID(e.target.value)}
            placeholder="UUID characteristic write"
          />
        </label>
        <div className="stack">
          <button type="button" onClick={connectPrinter}>
            Connect Bluetooth Printer
          </button>
          <small>{printerName}</small>
        </div>
      </section>

      <section className="card grid-4">
        <label>
          Tanggal Jual
          <input type="date" value={tglJual} onChange={(e) => setTglJual(e.target.value)} />
        </label>
        <label>
          Kode Sales
          <input value={kodeSales} onChange={(e) => setKodeSales(e.target.value)} />
        </label>
        <label>
          Nama Customer
          <input value={namaCustomer} onChange={(e) => setNamaCustomer(e.target.value)} />
        </label>
        <label>
          No HP
          <input value={noHp} onChange={(e) => setNoHp(e.target.value)} />
        </label>
        <label className="col-span-2">
          Alamat Customer
          <input value={alamatCustomer} onChange={(e) => setAlamatCustomer(e.target.value)} />
        </label>
        <label>
          Metode Bayar
          <select
            value={paymentMethod}
            onChange={(e) =>
              setPaymentMethod(e.target.value as "CASH" | "TRANSFER" | "QRIS" | "CARD")
            }
          >
            <option value="CASH">CASH</option>
            <option value="TRANSFER">TRANSFER</option>
            <option value="QRIS">QRIS</option>
            <option value="CARD">CARD</option>
          </select>
        </label>
        <label>
          Referensi Bayar
          <input
            value={paymentReference}
            onChange={(e) => setPaymentReference(e.target.value)}
            placeholder="No referensi / catatan"
          />
        </label>
        <label>
          Nominal Bayar
          <input
            type="number"
            value={cashNominal}
            onChange={(e) => setCashNominal(Number(e.target.value || 0))}
          />
        </label>
      </section>

      <section className="card">
        <h2>Detail Barang</h2>
        <div className="items">
          {items.map((item, index) => (
            <div key={index} className="item-row">
              <input
                placeholder="Kode Barang"
                value={item.kode_barang}
                onChange={(e) => updateItem(index, { kode_barang: e.target.value })}
              />
              <input
                placeholder="Barcode (opsional)"
                value={item.kode_barcode}
                onChange={(e) => updateItem(index, { kode_barcode: e.target.value })}
              />
              <input
                placeholder="Nama Barang"
                value={item.nama_barang}
                onChange={(e) => updateItem(index, { nama_barang: e.target.value })}
              />
              <input
                type="number"
                placeholder="Qty"
                value={item.qty}
                onChange={(e) => updateItem(index, { qty: Number(e.target.value || 0) })}
              />
              <input
                type="number"
                placeholder="Harga"
                value={item.harga_jual}
                onChange={(e) => updateItem(index, { harga_jual: Number(e.target.value || 0) })}
              />
              <input
                type="number"
                placeholder="Disc Rp"
                value={item.disc_rp}
                onChange={(e) => updateItem(index, { disc_rp: Number(e.target.value || 0) })}
              />
              <input
                placeholder="Satuan"
                value={item.satuan}
                onChange={(e) => updateItem(index, { satuan: e.target.value })}
              />
              <button
                type="button"
                className="danger"
                onClick={() => removeItem(index)}
                disabled={items.length === 1}
              >
                Hapus
              </button>
            </div>
          ))}
        </div>

        <div className="actions">
          <button type="button" onClick={addItem}>
            Tambah Item
          </button>
        </div>

        <div className="summary">
          <div>Total Kotor: Rp {toRupiah(totals.gross)}</div>
          <div>Total Diskon: Rp {toRupiah(totals.disc)}</div>
          <div className="strong">Grand Total: Rp {toRupiah(totals.net)}</div>
        </div>

        <div className="actions">
          <button type="button" onClick={saveAndPrint} disabled={isSaving}>
            {isSaving ? "Menyimpan..." : "Simpan Transaksi + Cetak Nota"}
          </button>
        </div>
      </section>

      <section className="card">
        <h2>Status</h2>
        <p>{status || "Belum ada aksi"}</p>
      </section>

      <section className="card">
        <h2>Preview Nota TXT</h2>
        <pre>{lastReceipt || "Belum ada nota"}</pre>
      </section>
    </div>
  );
}

export default App;
