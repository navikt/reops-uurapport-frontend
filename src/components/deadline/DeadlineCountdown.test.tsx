import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DeadlineCountdown from "./DeadlineCountdown";
import { useDeadlineOverride } from "./useDeadline";

vi.mock("./useDeadline", () => ({ useDeadlineOverride: vi.fn() }));

beforeEach(() => {
  vi.useFakeTimers();
  vi.mocked(useDeadlineOverride).mockReturnValue({
    override: null,
    mutate: vi.fn(),
    isLoading: false,
    error: undefined,
  });
});
afterEach(() => vi.useRealTimers());

function mountAt(now: Date) {
  vi.setSystemTime(now);
  render(<DeadlineCountdown />);
  act(() => vi.advanceTimersByTime(0));
}

describe("DeadlineCountdown", () => {
  it("keeps the existing visibility window before the default deadline", () => {
    mountAt(new Date(2026, 10, 12));
    expect(
      screen.getByRole("heading", { name: /20. desember 2026/ }),
    ).toBeInTheDocument();
  });

  it("stays hidden outside the existing visibility window", () => {
    mountAt(new Date(2026, 7, 1));
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("uses the custom annual date without falling back to December", () => {
    vi.mocked(useDeadlineOverride).mockReturnValue({
      override: "2025-11-30",
      mutate: vi.fn(),
      isLoading: false,
      error: undefined,
    });
    mountAt(new Date(2026, 10, 12));
    expect(
      screen.getByRole("heading", { name: /30. november 2026/ }),
    ).toBeInTheDocument();
  });

  it("rolls forward when left open across the deadline, hiding the next year's banner", () => {
    mountAt(new Date(2026, 11, 20, 23, 59, 30));
    expect(
      screen.getByRole("heading", { name: /20. desember 2026/ }),
    ).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(60_000));
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });
});
