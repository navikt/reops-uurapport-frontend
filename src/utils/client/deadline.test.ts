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

  it("keeps the custom month and day when advancing to the next year", () => {
    const d = resolveDeadline("2026-11-30", new Date(2026, 11, 1));
    expect([d.getFullYear(), d.getMonth(), d.getDate()]).toEqual([
      2027, 10, 30,
    ]);
  });

  it("advances a saved December deadline by one year after it passes", () => {
    const d = resolveDeadline("2026-12-20", new Date(2026, 11, 21));
    expect([d.getFullYear(), d.getMonth(), d.getDate()]).toEqual([
      2027, 11, 20,
    ]);
  });

  it("handles settings saved several years ago without reverting to December", () => {
    const d = resolveDeadline("2020-06-15", new Date(2026, 10, 12));
    expect([d.getFullYear(), d.getMonth(), d.getDate()]).toEqual([2027, 5, 15]);
  });

  it("keeps the deadline until the entire selected day has passed", () => {
    const d = resolveDeadline(
      "2026-11-30",
      new Date(2026, 10, 30, 23, 59, 59, 999),
    );
    expect(d.getFullYear()).toBe(2026);
    expect(
      resolveDeadline("2026-11-30", new Date(2026, 11, 1)).getFullYear(),
    ).toBe(2027);
  });

  it("does not pull an explicitly selected future-year deadline forward", () => {
    const d = resolveDeadline("2028-03-15", new Date(2026, 10, 12));
    expect([d.getFullYear(), d.getMonth(), d.getDate()]).toEqual([2028, 2, 15]);
  });

  it("uses February 28 in non-leap years without losing a February 29 anchor", () => {
    const d = resolveDeadline("2024-02-29", new Date(2026, 0, 1));
    expect([d.getFullYear(), d.getMonth(), d.getDate()]).toEqual([2026, 1, 28]);
    const leap = resolveDeadline("2024-02-29", new Date(2028, 0, 1));
    expect([leap.getFullYear(), leap.getMonth(), leap.getDate()]).toEqual([
      2028, 1, 29,
    ]);
  });

  it.each([null, "", "bad-date", "2026-02-31", "2026-13-01"])(
    "uses the initial December default for absent or invalid setting %s",
    (value) => {
      const d = resolveDeadline(value, new Date(2026, 5, 1));
      expect([d.getFullYear(), d.getMonth(), d.getDate()]).toEqual([
        2026, 11, 20,
      ]);
    },
  );

  it("splits time left and never goes negative", () => {
    const now = new Date(2026, 0, 1, 0, 0, 0);
    const t = getTimeLeft(new Date(2026, 0, 2, 1, 2, 3), now);
    expect([t.days, t.hours, t.minutes, t.seconds]).toEqual([1, 1, 2, 3]);
    expect(getTimeLeft(now, new Date(2026, 0, 2)).totalMs).toBe(0);
  });
});
