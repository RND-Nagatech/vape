# Abivape Transaksi Bluetooth

Project ini adalah aplikasi terpisah dari FE/BE utama Abivape, fokus untuk:
- Input transaksi penjualan sederhana
- Simpan transaksi ke endpoint BE Abivape (`POST /v1/penjualan`)
- Cetak nota ke printer Bluetooth thermal (ESC/POS via Web Bluetooth)
- Fallback otomatis ke file `autoprint_lm.txt` jika print Bluetooth gagal/belum connect

## Lokasi project

- [abivape-transaksi](abivape-transaksi)

## Menjalankan project

1. Masuk folder project

```bash
cd /Users/aandiyanti/Documents/RnD/PROJECT/vape/abivape-transaksi
```

2. Install dependency

```bash
npm install
```

3. Jalankan dev server

```bash
npm run dev
```

App jalan di `http://localhost:4177`.

## PWA (Installable App)

Project ini sudah diaktifkan sebagai PWA.

Cara coba install:
- Jalankan app (`npm run dev`) lalu buka di Chrome/Edge.
- Setelah halaman terbuka, pilih opsi **Install App** dari address bar/menu browser.
- Setelah terinstall, app bisa dibuka seperti aplikasi desktop.

Catatan:
- Untuk environment production, jalankan via HTTPS agar PWA behavior konsisten.
- Service worker akan aktif dan melakukan cache aset statis untuk pengalaman lebih stabil.

## Konfigurasi API

Di form bagian atas, isi:
- `API Base URL`: default `http://localhost:3100/v1`
- `Bearer Token`: jika endpoint butuh auth
- `Nama Toko`

## Konfigurasi Bluetooth Printer

Di form bagian printer, isi:
- `Service UUID`
- `Characteristic UUID`

Lalu klik **Connect Bluetooth Printer**.

Catatan:
- Browser wajib support Web Bluetooth (Chrome/Edge berbasis Chromium).
- Banyak printer thermal punya UUID berbeda-beda, isi sesuai spesifikasi printer Anda.
- Jika service/characteristic tidak cocok, koneksi/print akan gagal.

## Alur simpan transaksi dan print

1. Isi header transaksi + item
2. Klik **Simpan Transaksi + Cetak Nota**
3. App akan:
   - simpan transaksi ke API Abivape
   - bentuk nota text
   - kirim ke printer Bluetooth (ESC/POS)
4. Jika printer tidak connect atau gagal print, app otomatis download `autoprint_lm.txt`

## Referensi dari project Abivape

- Payload dan flow transaksi meniru endpoint penjualan dari FE/BE Abivape
- Fallback file nota memakai pola filename `autoprint_lm.txt` seperti di FE existing

## Batasan saat ini

- Form transaksi ini memang disederhanakan untuk fokus transaksi + print
- Jika schema endpoint `penjualan` di server Anda lebih ketat, sesuaikan payload di:
  - [src/services/api.ts](src/services/api.ts)
  - [src/App.tsx](src/App.tsx)
- Jika printer Bluetooth Anda tidak support Web Bluetooth, gunakan fallback TXT + helper app thermal
