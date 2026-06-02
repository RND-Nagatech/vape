import type { TransactionInput, TransactionResponse } from "../types/transaction";

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("id-ID").format(value || 0);

export const buildReceiptText = (
  input: TransactionInput,
  response?: TransactionResponse,
  storeName = "ABIVAPE",
): string => {
  const mergedItems = response?.items?.length ? response.items : input.items;
  const noPenjualan = response?.no_penjualan || "-";
  const tanggal = response?.tgl_jual || input.tgl_jual;
  const customer = response?.nama_customer || input.nama_customer || "REG";
  const noHp = response?.no_hp || input.no_hp || "-";
  const totalHarga =
    response?.total_harga ||
    mergedItems.reduce(
      (sum, item) => sum + Number(item.qty || 0) * Number(item.harga_jual || 0),
      0,
    );

  const totalDisc =
    response?.total_disc_rp ||
    mergedItems.reduce((sum, item) => sum + Number(item.disc_rp || 0), 0);

  const lines: string[] = [];
  lines.push(storeName);
  lines.push("----------------------------------------");
  lines.push("NOTA PENJUALAN");
  lines.push(`No      : ${noPenjualan}`);
  lines.push(`Tanggal : ${tanggal}`);
  lines.push(`Customer: ${customer}`);
  lines.push(`No HP   : ${noHp}`);
  lines.push("----------------------------------------");

  mergedItems.forEach((item) => {
    const nama = item.nama_barang || "-";
    const qty = Number(item.qty || 0);
    const harga = Number(item.harga_jual || 0);
    const subtotal = qty * harga;
    const disc = Number(item.disc_rp || 0);

    lines.push(nama);
    lines.push(`${qty} x Rp ${formatCurrency(harga)} = Rp ${formatCurrency(subtotal)}`);
    if (disc > 0) {
      lines.push(`Diskon: -Rp ${formatCurrency(disc)}`);
    }
  });

  lines.push("----------------------------------------");
  lines.push(`TOTAL        : Rp ${formatCurrency(totalHarga)}`);
  if (totalDisc > 0) {
    lines.push(`TOTAL DISKON : -Rp ${formatCurrency(totalDisc)}`);
  }

  const pembayaran = response?.pembayaran?.length
    ? response.pembayaran
    : input.pembayaran;

  lines.push("----------------------------------------");
  lines.push("Pembayaran:");
  pembayaran.forEach((pay) => {
    lines.push(`- ${pay.metode}: Rp ${formatCurrency(Number(pay.jumlah || 0))}`);
    if (pay.referensi) {
      lines.push(`  Ref: ${pay.referensi}`);
    }
  });

  lines.push(`TOTAL BAYAR  : Rp ${formatCurrency(Number(response?.total_bayar || totalHarga))}`);
  if (Number(response?.kembalian || 0) > 0) {
    lines.push(`KEMBALIAN    : Rp ${formatCurrency(Number(response?.kembalian || 0))}`);
  }

  lines.push("----------------------------------------");
  lines.push("Terima kasih");

  return lines.join("\n");
};

export const downloadReceiptAsTxt = (content: string): void => {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "autoprint_lm.txt";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
