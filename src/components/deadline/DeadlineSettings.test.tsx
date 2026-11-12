import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import DeadlineSettings from "./DeadlineSettings";
import { useDeadlineOverride } from "./useDeadline";
import { updateDeadline } from "@src/services/deadlineServices";

vi.mock("./useDeadline", () => ({ useDeadlineOverride: vi.fn() }));
vi.mock("@src/services/deadlineServices", () => ({ updateDeadline: vi.fn() }));

const mutate = vi.fn();
const state = {
  override: null as string | null,
  mutate,
  isLoading: false,
  error: undefined as Error | undefined,
};
const input = () =>
  screen.getByLabelText("Frist for tilgjengelighetserklæring");
const tick = async (ms = 500) => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 10, 12, 12));
  vi.clearAllMocks();
  state.override = null;
  state.isLoading = false;
  state.error = undefined;
  mutate.mockResolvedValue(undefined);
  vi.mocked(updateDeadline).mockReset().mockResolvedValue(undefined);
  vi.mocked(useDeadlineOverride).mockReturnValue(state);
});
afterEach(() => vi.useRealTimers());

describe("DeadlineSettings", () => {
  it("prefills the initial default without a heading, save button, reset button or initial write", () => {
    render(<DeadlineSettings />);
    expect(input()).toHaveValue("20.12.2026");
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Lagre|Tilbakestill/ }),
    ).not.toBeInTheDocument();
    expect(updateDeadline).not.toHaveBeenCalled();
  });

  it("waits for the saved deadline before initializing the picker", () => {
    state.isLoading = true;
    const { rerender } = render(<DeadlineSettings />);
    expect(
      screen.queryByLabelText("Frist for tilgjengelighetserklæring"),
    ).not.toBeInTheDocument();
    state.isLoading = false;
    state.override = "2026-11-30";
    rerender(<DeadlineSettings />);
    expect(input()).toHaveValue("30.11.2026");
  });

  it("prefills next year's occurrence once the saved deadline has passed", () => {
    vi.setSystemTime(new Date(2026, 11, 21));
    state.override = "2026-12-20";
    render(<DeadlineSettings />);
    expect(input()).toHaveValue("20.12.2027");
    expect(updateDeadline).not.toHaveBeenCalled();
  });

  it("autosaves a valid new date and updates the shared deadline cache", async () => {
    render(<DeadlineSettings />);
    fireEvent.change(input(), { target: { value: "30.11.2026" } });
    await tick();
    expect(updateDeadline).toHaveBeenCalledExactlyOnceWith("2026-11-30");
    expect(mutate).toHaveBeenCalledWith(
      { deadline: "2026-11-30" },
      { revalidate: false },
    );
    expect(screen.getByRole("status")).toHaveTextContent("Fristen er lagret.");
  });

  it("coalesces rapid edits and saves only the latest valid date", async () => {
    render(<DeadlineSettings />);
    fireEvent.change(input(), { target: { value: "30.11.2026" } });
    fireEvent.change(input(), { target: { value: "01.12.2026" } });
    await tick();
    expect(updateDeadline).toHaveBeenCalledExactlyOnceWith("2026-12-01");
  });

  it.each(["", "not a date", "31.11.2026", "01.01.2026"])(
    "does not save invalid, empty or past input %s",
    async (value) => {
      render(<DeadlineSettings />);
      fireEvent.change(input(), { target: { value } });
      await tick(1000);
      expect(updateDeadline).not.toHaveBeenCalled();
      expect(input()).toHaveAttribute("aria-invalid", "true");
    },
  );

  it("cancels a pending valid save if the input becomes invalid", async () => {
    render(<DeadlineSettings />);
    fireEvent.change(input(), { target: { value: "30.11.2026" } });
    fireEvent.change(input(), { target: { value: "bad" } });
    await tick(1000);
    expect(updateDeadline).not.toHaveBeenCalled();
  });

  it("flushes a pending valid change when leaving the field", async () => {
    render(<DeadlineSettings />);
    fireEvent.change(input(), { target: { value: "30.11.2026" } });
    fireEvent.blur(input());
    await tick(0);
    expect(updateDeadline).toHaveBeenCalledExactlyOnceWith("2026-11-30");
  });

  it("serializes saves so the latest edit wins even when the first request is slow", async () => {
    let finishFirst!: () => void;
    let finishSecond!: () => void;
    vi.mocked(updateDeadline)
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            finishFirst = resolve;
          }),
      )
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            finishSecond = resolve;
          }),
      );
    render(<DeadlineSettings />);
    fireEvent.change(input(), { target: { value: "30.11.2026" } });
    await tick();
    fireEvent.change(input(), { target: { value: "01.12.2026" } });
    await tick();
    expect(updateDeadline).toHaveBeenCalledTimes(1);
    await act(async () => {
      finishFirst();
    });
    expect(updateDeadline).toHaveBeenNthCalledWith(2, "2026-12-01");
    expect(screen.getByRole("status")).toHaveTextContent("Lagrer");
    expect(input()).toHaveValue("01.12.2026");
    await act(async () => {
      finishSecond();
    });
    expect(screen.getByRole("status")).toHaveTextContent("Fristen er lagret.");
  });

  it("offers retry when autosaving fails", async () => {
    vi.mocked(updateDeadline).mockRejectedValueOnce(new Error("Unavailable"));
    render(<DeadlineSettings />);
    fireEvent.change(input(), { target: { value: "30.11.2026" } });
    await tick();
    expect(screen.getByText("Kunne ikke lagre fristen")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Prøv igjen" }));
    await tick(0);
    expect(updateDeadline).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("status")).toHaveTextContent("Fristen er lagret.");
  });

  it("does not show a default date when loading the saved setting fails", () => {
    state.error = new Error("Unavailable");
    render(<DeadlineSettings />);
    expect(
      screen.queryByLabelText("Frist for tilgjengelighetserklæring"),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Prøv igjen" }));
    expect(mutate).toHaveBeenCalled();
    expect(updateDeadline).not.toHaveBeenCalled();
  });

  it("has no automated accessibility violations", async () => {
    vi.useRealTimers();
    const { container } = render(<DeadlineSettings />);
    expect((await axe(container)).violations).toEqual([]);
  });
});
