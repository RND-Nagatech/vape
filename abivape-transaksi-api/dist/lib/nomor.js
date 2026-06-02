const PREFIX = "PJ";
const getDateCode = (dateIso) => {
    const d = new Date(dateIso);
    const yy = String(d.getFullYear()).slice(-2);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yy}${mm}${dd}`;
};
export const generateNoPenjualan = (tglJualIso, records) => {
    const dateCode = getDateCode(tglJualIso);
    const prefix = `${PREFIX}-${dateCode}-`;
    const used = records
        .map((row) => row.no_penjualan)
        .filter((no) => no.startsWith(prefix))
        .map((no) => Number(no.split("-").at(-1) || 0))
        .filter((n) => Number.isFinite(n));
    const next = (used.length ? Math.max(...used) : 0) + 1;
    return `${prefix}${String(next).padStart(4, "0")}`;
};
