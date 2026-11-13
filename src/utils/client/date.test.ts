import { describe, expect, it } from "vitest";
import { formatDate, formatShortDate } from "./date";

describe("formatShortDate", () => {
  it.each([
    ["2026-01-05T12:00:00", "05.01.2026"],
    ["2026-11-13T12:00:00", "13.11.2026"],
    ["2024-02-29T12:00:00", "29.02.2024"],
  ])("formats %s as %s", (date, expected) => {
    expect(formatShortDate(date)).toBe(expected);
  });
});

describe("formatDate", () => {
  it("retains the long Norwegian format", () => {
    expect(formatDate("2026-01-05T12:00:00")).toBe("5. januar 2026");
  });
});
