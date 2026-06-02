import { z } from "zod";

const metodePembayaranSchema = z.enum(["CASH", "TRANSFER", "QRIS", "CARD"]);

const itemSchema = z.object({
  kode_barang: z.string().min(1),
  kode_barcode: z.string().min(1),
  nama_barang: z.string().min(1),
  kode_kategori: z.string().min(1),
  kode_jenis: z.string().min(1),
  kode_merk: z.string().min(1),
  kode_varian: z.string().min(1),
  satuan: z.string().min(1),
  qty: z.number().positive(),
  harga_jual: z.number().nonnegative(),
  disc_persen: z.number().nonnegative().optional(),
  disc_rp: z.number().nonnegative().optional(),
  no_promo: z.string().optional(),
  deskripsi_promo: z.string().optional(),
  serial_number: z.string().optional(),
});

const pembayaranSchema = z.object({
  metode: metodePembayaranSchema,
  jumlah: z.number().nonnegative(),
  referensi: z.string().optional(),
  fee: z.number().nonnegative().optional(),
  kode_bank: z.string().optional(),
  no_rekening: z.string().optional(),
  no_rekening_plg: z.string().optional(),
});

export const createPenjualanSchema = z.object({
  tgl_jual: z.string().datetime(),
  kode_customer: z.string().optional(),
  nama_customer: z.string().optional(),
  alamat_customer: z.string().optional(),
  no_hp: z.string().optional(),
  items: z.array(itemSchema).min(1),
  pembayaran: z.array(pembayaranSchema).min(1),
  cashback_topup_rp: z.number().nonnegative().optional(),
  custom_amount_rp: z.number().nonnegative().optional(),
});

export type CreatePenjualanSchemaType = z.infer<typeof createPenjualanSchema>;
