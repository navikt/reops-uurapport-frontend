import { describe, it, expect } from "vitest";
import { getTimeLeft, nextDefaultDeadline, resolveDeadline } from "./deadline";

describe("deadline", () => {
  it("defaults to 20 December this year", () => {
    const d = nextDefaultDeadline(new Date(2026, 5, 1));
    expect([d.getFullYear(), d.getMonth(), d.getDate()]).toEqual([
      2026, 11, 20,
    ]);
  });

  it("rolls over to next year once the deadline has passed", () => {
    const d = nextDefaultDeadline(new Date(2026, 11, 21));
    expect(d.getFullYear()).toBe(2027);
  });

  it("is still the same day on 20 December itself", () => {
    const d = nextDefaultDeadline(new Date(2026, 11, 20, 12));
    expect(d.getFullYear()).toBe(2026);
  });

  it("uses admin override while in the future", () => {
    const d = resolveDeadline("2026-11-30", new Date(2026, 9, 1));
    expect([d.getMonth(), d.getDate()]).toEqual([10, 30]);
  });

  it("falls back to default when override has passed", () => {
    const d = resolveDeadline("2026-11-30", new Date(2026, 11, 1));
    expect([d.getFullYear(), d.getMonth(), d.getDate()]).toEqual([
      2026, 11, 20,
    ]);
  });

  it("splits time left and never goes negative", () => {
    const now = new Date(2026, 0, 1, 0, 0, 0);
    const t = getTimeLeft(new Date(2026, 0, 2, 1, 2, 3), now);
    expect([t.days, t.hours, t.minutes, t.seconds]).toEqual([1, 1, 2, 3]);
    expect(getTimeLeft(now, new Date(2026, 0, 2)).totalMs).toBe(0);
  });
});
