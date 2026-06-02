export interface TransactionItemInput {
  kode_barang: string;
  kode_barcode?: string;
  nama_barang: string;
  kode_kategori?: string;
  kode_jenis?: string;
  kode_merk?: string;
  kode_varian?: string;
  satuan?: string;
  qty: number;
  harga_jual: number;
  disc_persen?: number;
  disc_rp?: number;
  no_promo?: string;
  deskripsi_promo?: string;
  serial_number?: string;
}

export interface PaymentLine {
  metode: "CASH" | "TRANSFER" | "QRIS" | "CARD";
  jumlah: number;
  referensi?: string;
  fee?: number;
  kode_bank?: string;
  no_rekening?: string;
  no_rekening_plg?: string;
}

export interface TransactionInput {
  tgl_jual: string;
  nama_customer: string;
  no_hp: string;
  alamat_customer: string;
  kode_sales: string;
  items: TransactionItemInput[];
  pembayaran: PaymentLine[];
}

export interface TransactionResponse {
  no_penjualan?: string;
  tgl_jual?: string;
  nama_customer?: string;
  no_hp?: string;
  alamat_customer?: string;
  kode_sales?: string;
  items?: Array<{
    kode_barang?: string;
    nama_barang?: string;
    qty?: number;
    harga_jual?: number;
    disc_rp?: number;
  }>;
  pembayaran?: PaymentLine[];
  total_harga?: number;
  total_disc_rp?: number;
  total_bayar?: number;
  kembalian?: number;
}
