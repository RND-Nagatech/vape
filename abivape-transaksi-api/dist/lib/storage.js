import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FILE_PATH = path.resolve(__dirname, "../../data/transactions.json");
export const readTransactions = async () => {
    const content = await fs.readFile(FILE_PATH, "utf8");
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
};
export const writeTransactions = async (rows) => {
    await fs.writeFile(FILE_PATH, JSON.stringify(rows, null, 2), "utf8");
};
