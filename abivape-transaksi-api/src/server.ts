import express from "express";
import cors from "cors";
import { penjualanRouter } from "./routes/penjualan.js";

const app = express();
const PORT = Number(process.env.PORT || 3100);

app.use(
  cors({
    origin: ["http://localhost:4177", "http://127.0.0.1:4177"],
  }),
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "abivape-transaksi-api",
    timestamp: new Date().toISOString(),
  });
});

app.use("/v1/penjualan", penjualanRouter);

app.listen(PORT, () => {
  console.log(`[abivape-transaksi-api] running on http://localhost:${PORT}`);
});
