import { Router } from "express";
import { createPenjualanSchema } from "../lib/schema.js";
import { generateNoPenjualan } from "../lib/nomor.js";
import { readTransactions, writeTransactions } from "../lib/storage.js";
export const penjualanRouter = Router();
penjualanRouter.post("/", async (req, res) => {
    const parsed = createPenjualanSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            message: "Payload transaksi tidak valid",
            errors: parsed.error.flatten(),
        });
    }
    const payload = parsed.data;
    const totalQty = payload.items.reduce((sum, item) => sum + item.qty, 0);
    const totalDiscRp = payload.items.reduce((sum, item) => sum + item.qty * (item.disc_rp || 0), 0);
    const totalHargaBarang = payload.items.reduce((sum, item) => sum + item.qty * (item.harga_jual - (item.disc_rp || 0)), 0);
    const cashbackTopupRp = Number(payload.cashback_topup_rp || 0);
    const customAmountRp = Number(payload.custom_amount_rp || 0);
    const totalHarga = totalHargaBarang + cashbackTopupRp + customAmountRp;
    const totalBayar = payload.pembayaran.reduce((sum, item) => sum + item.jumlah, 0);
    if (totalBayar < totalHarga) {
        return res.status(400).json({
            message: "Jumlah pembayaran kurang dari total transaksi.",
        });
    }
    const kembalian = totalBayar - totalHarga;
    const rows = await readTransactions();
    const noPenjualan = generateNoPenjualan(payload.tgl_jual, rows);
    const record = {
        no_penjualan: noPenjualan,
        tgl_jual: payload.tgl_jual,
        kode_customer: payload.kode_customer || "GUEST",
        nama_customer: payload.nama_customer || "-",
        alamat_customer: payload.alamat_customer || "-",
        no_hp: payload.no_hp || "-",
        items: payload.items,
        pembayaran: payload.pembayaran,
        cashback_topup_rp: cashbackTopupRp,
        custom_amount_rp: customAmountRp,
        total_qty: totalQty,
        total_harga: totalHarga,
        total_disc_rp: totalDiscRp,
        total_bayar: totalBayar,
        kembalian,
        status: "OPEN",
        created_at: new Date().toISOString(),
    };
    rows.push(record);
    await writeTransactions(rows);
    return res.status(201).json({
        message: "Transaksi berhasil disimpan",
        data: record,
    });
});
penjualanRouter.get("/", async (_req, res) => {
    const rows = await readTransactions();
    return res.json({
        message: "Data transaksi",
        count: rows.length,
        data: rows,
    });
});
