# Abivape Transaksi API

Backend terpisah khusus untuk aplikasi `abivape-transaksi`.

## Fitur

- `POST /v1/penjualan` simpan transaksi
- `GET /v1/penjualan` lihat list transaksi tersimpan
- `GET /health` health check
- Penyimpanan lokal di file `data/transactions.json`

## Menjalankan Backend

```bash
cd /Users/aandiyanti/Documents/RnD/PROJECT/vape/abivape-transaksi-api
npm install
npm run dev
```

Server jalan di:
- `http://localhost:3100`

## Menjalankan Frontend (project terpisah)

```bash
cd /Users/aandiyanti/Documents/RnD/PROJECT/vape/abivape-transaksi
npm install
npm run dev
```

UI jalan di:
- `http://localhost:4177`

Default `API Base URL` pada UI sudah diarahkan ke:
- `http://localhost:3100/v1`

## Catatan

- Ini backend ringan untuk kebutuhan transaksi terpisah.
- Payload endpoint `POST /v1/penjualan` disesuaikan dengan DTO utama Abivape agar kompatibel dengan flow FE transaksi.
