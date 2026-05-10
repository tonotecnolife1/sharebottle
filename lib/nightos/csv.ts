/**
 * CSV serialization helpers.
 *
 * - RFC 4180 compliant escaping (double-quote literal, embed newlines, etc.)
 * - UTF-8 BOM prepended so Excel for Japan opens 日本語 correctly
 * - Tagged blob factory so the caller can `URL.createObjectURL`
 */

export type CsvCell = string | number | boolean | null | undefined | Date;
export type CsvRow = Record<string, CsvCell>;
export interface CsvColumn<T> {
  /** Column header in Japanese (or whatever target locale needs). */
  header: string;
  /** Pull a value out of a row. Stringification handled by the writer. */
  value: (row: T) => CsvCell;
}

const QUOTE = '"';
const SEPARATOR = ",";
const NEWLINE = "\r\n"; // Excel-friendly
const BOM = "﻿";

function serializeCell(cell: CsvCell): string {
  if (cell === null || cell === undefined) return "";
  let s: string;
  if (cell instanceof Date) s = cell.toISOString();
  else if (typeof cell === "boolean") s = cell ? "yes" : "no";
  else s = String(cell);

  // Quote if it contains special chars, otherwise raw.
  if (/[",\r\n]/.test(s)) {
    return QUOTE + s.replace(/"/g, '""') + QUOTE;
  }
  return s;
}

export function buildCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const header = columns.map((c) => serializeCell(c.header)).join(SEPARATOR);
  const lines = rows.map((row) =>
    columns.map((c) => serializeCell(c.value(row))).join(SEPARATOR),
  );
  return BOM + [header, ...lines].join(NEWLINE) + NEWLINE;
}

/**
 * Build a Blob suitable for `URL.createObjectURL`. Server actions that
 * return CSV directly should set `Content-Type: text/csv; charset=utf-8`.
 */
export function csvBlob(text: string): Blob {
  return new Blob([text], { type: "text/csv;charset=utf-8;" });
}

/**
 * Filename helper: `<prefix>-2026-05-01.csv`.
 */
export function csvFilename(prefix: string, date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${prefix}-${y}-${m}-${d}.csv`;
}
