import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  calculateReportTitleWidth,
  useReportTitleWidth,
} from "./useReportTitleWidth";

describe("calculateReportTitleWidth", () => {
  it("fills the remaining width for all-report and archive columns", () => {
    expect(calculateReportTitleWidth(1536, 16, 1120)).toBe(365.5);
    expect(calculateReportTitleWidth(1536, 16, 900)).toBe(585.5);
  });

  it("retains the minimum on narrow screens and uses the root font size", () => {
    expect(calculateReportTitleWidth(800, 16, 1120)).toBe(300);
    expect(calculateReportTitleWidth(1920.5, 20, 1120)).toBe(376);
  });
});

function TestGrid({ otherWidths }: { otherWidths: number }) {
  const { wrapperRef, width, onChange } = useReportTitleWidth(otherWidths);
  return (
    <div ref={wrapperRef} data-testid="wrapper">
      <output>{width}</output>
      <button onClick={() => onChange(420)}>Resize</button>
    </div>
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
  document.documentElement.style.fontSize = "";
});

describe("useReportTitleWidth", () => {
  it("updates for available width and columns but preserves manual resizing", () => {
    let notify = () => {};
    const disconnect = vi.fn();
    class Observer {
      constructor(callback: () => void) {
        notify = callback;
      }
      observe() {}
      disconnect = disconnect;
    }
    vi.stubGlobal("ResizeObserver", Observer);
    document.documentElement.style.fontSize = "16px";
    const { rerender, unmount } = render(<TestGrid otherWidths={1120} />);
    const wrapper = screen.getByTestId("wrapper");
    let availableWidth = 1536;
    vi.spyOn(wrapper, "getBoundingClientRect").mockImplementation(
      () => ({ width: availableWidth }) as DOMRect,
    );
    act(() => notify());
    expect(screen.getByText("365.5")).toBeInTheDocument();
    rerender(<TestGrid otherWidths={900} />);
    expect(screen.getByText("585.5")).toBeInTheDocument();
    act(() => screen.getByRole("button").click());
    availableWidth = 1700;
    act(() => notify());
    rerender(<TestGrid otherWidths={1120} />);
    expect(screen.getByText("420")).toBeInTheDocument();
    unmount();
    expect(disconnect).toHaveBeenCalledOnce();
  });

  it("uses the default width when ResizeObserver is unavailable", () => {
    vi.stubGlobal("ResizeObserver", undefined);
    render(<TestGrid otherWidths={1120} />);
    expect(screen.getByText("300")).toBeInTheDocument();
  });
});
