export type MetodePembayaran = "CASH" | "TRANSFER" | "QRIS" | "CARD";

export interface PenjualanItem {
  kode_barang: string;
  kode_barcode: string;
  nama_barang: string;
  kode_kategori: string;
  kode_jenis: string;
  kode_merk: string;
  kode_varian: string;
  satuan: string;
  qty: number;
  harga_jual: number;
  disc_persen?: number;
  disc_rp?: number;
  no_promo?: string;
  deskripsi_promo?: string;
  serial_number?: string;
}

export interface PembayaranItem {
  metode: MetodePembayaran;
  jumlah: number;
  referensi?: string;
  fee?: number;
  kode_bank?: string;
  no_rekening?: string;
  no_rekening_plg?: string;
}

export interface CreatePenjualanPayload {
  tgl_jual: string;
  kode_customer?: string;
  nama_customer?: string;
  alamat_customer?: string;
  no_hp?: string;
  items: PenjualanItem[];
  pembayaran: PembayaranItem[];
  cashback_topup_rp?: number;
  custom_amount_rp?: number;
}

export interface PenjualanRecord extends CreatePenjualanPayload {
  no_penjualan: string;
  total_qty: number;
  total_harga: number;
  total_disc_rp: number;
  total_bayar: number;
  kembalian: number;
  status: "OPEN";
  created_at: string;
}
