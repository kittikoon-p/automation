"use client";

import { Download, FileSpreadsheet } from "lucide-react";

export interface ExportColumn {
  key: string;
  label: string;
}

function downloadBlob(content: string, mime: string, filename: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function csvCell(value: string | number | null | undefined): string {
  const v = value === null || value === undefined ? "" : String(value);
  if (/[",\r\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

export default function ExportButtons({
  rows,
  columns,
  filename,
}: {
  rows: Record<string, string | number | null | undefined>[];
  columns: ExportColumn[];
  filename: string;
}) {
  function handleCSV() {
    const header = columns.map((c) => csvCell(c.label)).join(",");
    const body = rows.map((r) =>
      columns.map((c) => csvCell(r[c.key])).join(",")
    );
    // BOM so Thai text opens correctly in Excel.
    const content = "\uFEFF" + [header, ...body].join("\r\n");
    downloadBlob(content, "text/csv;charset=utf-8", `${filename}.csv`);
  }

  function handleExcel() {
    const thead = columns.map((c) => `<th>${c.label}</th>`).join("");
    const tbody = rows
      .map(
        (r) =>
          `<tr>${columns
            .map((c) => `<td>${String(r[c.key] ?? "")}</td>`)
            .join("")}</tr>`
      )
      .join("");
    const html = `<html xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"/></head><body><table border="1">${thead}${tbody}</table></body></html>`;
    downloadBlob(html, "application/vnd.ms-excel", `${filename}.xls`);
  }

  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={handleCSV} className="btn-ghost" title="ดาวน์โหลด CSV">
        <Download className="h-4 w-4" />
        <span className="hidden sm:inline">CSV</span>
      </button>
      <button type="button" onClick={handleExcel} className="btn-ghost" title="ดาวน์โหลด Excel">
        <FileSpreadsheet className="h-4 w-4" />
        <span className="hidden sm:inline">Excel</span>
      </button>
    </div>
  );
}