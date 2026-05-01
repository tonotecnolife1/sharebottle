"use client";

import { Download } from "lucide-react";
import { useState } from "react";
import { buildCsv, csvBlob, csvFilename, type CsvColumn } from "@/lib/nightos/csv";

interface Props<T> {
  rows: T[];
  columns: CsvColumn<T>[];
  /** Filename prefix without date or extension (e.g. "customers"). */
  filenamePrefix: string;
  /** Button label, default "CSV ダウンロード". */
  label?: string;
  /** Visual size; small fits inline next to a list header. */
  size?: "sm" | "md";
}

export function CsvDownloadButton<T>({
  rows,
  columns,
  filenamePrefix,
  label = "CSV ダウンロード",
  size = "sm",
}: Props<T>) {
  const [busy, setBusy] = useState(false);

  const onClick = () => {
    setBusy(true);
    try {
      const text = buildCsv(rows, columns);
      const blob = csvBlob(text);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = csvFilename(filenamePrefix);
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  };

  const padding = size === "sm" ? "px-3 py-1.5 text-[12px]" : "px-5 py-2.5 text-body-sm";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy || rows.length === 0}
      title={rows.length === 0 ? "ダウンロード対象がありません" : undefined}
      className={`inline-flex items-center gap-1.5 rounded-pill border border-gold/30 bg-pearl-warm/80 text-ink hover:border-gold/50 hover:-translate-y-px transition shadow-soft will-change-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 ${padding}`}
    >
      <Download size={size === "sm" ? 12 : 14} />
      {busy ? "生成中..." : label}
    </button>
  );
}
