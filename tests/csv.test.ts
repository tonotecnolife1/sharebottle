import { describe, it, expect } from "vitest";
import { buildCsv, csvFilename, type CsvColumn } from "@/lib/nightos/csv";

describe("buildCsv", () => {
  const columns: CsvColumn<{ id: string; name: string; note: string | null }>[] =
    [
      { header: "ID", value: (r) => r.id },
      { header: "氏名", value: (r) => r.name },
      { header: "メモ", value: (r) => r.note },
    ];

  it("emits a UTF-8 BOM + header + CRLF lines", () => {
    const csv = buildCsv([{ id: "1", name: "あかり", note: "新規" }], columns);
    expect(csv.startsWith("﻿")).toBe(true);
    expect(csv).toContain("ID,氏名,メモ\r\n");
    expect(csv).toContain("1,あかり,新規\r\n");
  });

  it("quotes cells containing comma / quote / newline", () => {
    const csv = buildCsv(
      [
        { id: "1", name: "山田, 太郎", note: 'a "quoted" value' },
        { id: "2", name: "Line\nBreak", note: null },
      ],
      columns,
    );
    expect(csv).toContain('"山田, 太郎"');
    expect(csv).toContain('"a ""quoted"" value"');
    expect(csv).toContain('"Line\nBreak"');
  });

  it("renders null/undefined as empty string", () => {
    const csv = buildCsv([{ id: "1", name: "テスト", note: null }], columns);
    // Last column is empty
    expect(csv).toContain("1,テスト,\r\n");
  });

  it("handles empty rows array — header only", () => {
    const csv = buildCsv<{ id: string; name: string; note: null }>(
      [],
      columns,
    );
    // BOM + header + trailing newline
    expect(csv).toBe("﻿ID,氏名,メモ\r\n");
  });
});

describe("csvFilename", () => {
  it("formats <prefix>-YYYY-MM-DD.csv", () => {
    const date = new Date("2026-05-01T12:34:56");
    expect(csvFilename("customers", date)).toBe("customers-2026-05-01.csv");
  });

  it("zero-pads month and day", () => {
    const date = new Date("2026-01-03T00:00:00");
    expect(csvFilename("visits", date)).toBe("visits-2026-01-03.csv");
  });
});
