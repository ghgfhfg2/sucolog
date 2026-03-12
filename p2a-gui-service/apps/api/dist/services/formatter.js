import fs from "node:fs";
import path from "node:path";
import XLSX from "xlsx";
import PDFDocument from "pdfkit";
function toCsv(data) {
    if (!data.length)
        return "";
    const headers = Object.keys(data[0]);
    const rows = data.map((row) => headers.map((h) => JSON.stringify(row[h] ?? "")).join(","));
    return [headers.join(","), ...rows].join("\n");
}
export async function saveOutputFile(params) {
    const { outputDir, jobId, format, data } = params;
    fs.mkdirSync(outputDir, { recursive: true });
    const base = path.join(outputDir, jobId);
    if (format === "json") {
        const filePath = `${base}.json`;
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
        return filePath;
    }
    if (format === "csv") {
        const filePath = `${base}.csv`;
        fs.writeFileSync(filePath, toCsv(data), "utf8");
        return filePath;
    }
    if (format === "xlsx") {
        const filePath = `${base}.xlsx`;
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, "output");
        XLSX.writeFile(wb, filePath);
        return filePath;
    }
    const filePath = `${base}.pdf`;
    const doc = new PDFDocument({ margin: 30 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);
    doc.fontSize(16).text("P2A Output", { underline: true });
    doc.moveDown();
    data.forEach((row, idx) => {
        doc.fontSize(12).text(`${idx + 1}. ${JSON.stringify(row)}`);
        doc.moveDown(0.5);
    });
    doc.end();
    await new Promise((resolve) => stream.on("finish", () => resolve()));
    return filePath;
}
