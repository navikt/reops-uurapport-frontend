import { act, render, renderHook } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useSelectedTeam } from "./useSelectedTeam";

let search = "";
const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push: vi.fn() }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(search),
}));

const teams = [
  { id: "first", name: "First", email: "first@example.com", members: [] },
  { id: "second", name: "Second", email: "second@example.com", members: [] },
];
const user = { email: "user@example.com", teams };
const key = "uurapport:selected-team:user@example.com";

beforeEach(() => {
  search = "";
  replace.mockReset();
  localStorage.clear();
});
afterEach(() => vi.restoreAllMocks());

describe("useSelectedTeam", () => {
  it("uses the first team if no preference exists", () => {
    const { result } = renderHook(() => useSelectedTeam(user));
    expect(result.current[0]).toBe("first");
  });

  it("restores the selected team after leaving and returning to the homepage", () => {
    const firstVisit = renderHook(() => useSelectedTeam(user));
    act(() => firstVisit.result.current[1]("second"));
    expect(replace).toHaveBeenCalledWith("/?team=second", { scroll: false });
    search = "team=second";
    firstVisit.rerender();
    expect(localStorage.getItem(key)).toBe("second");
    firstVisit.unmount();
    search = "";
    const returnVisit = renderHook(() => useSelectedTeam(user));
    expect(returnVisit.result.current[0]).toBe("second");
  });

  it("lets explicit team links and back/forward navigation override the saved preference", () => {
    localStorage.setItem(key, "second");
    search = "team=first";
    const { result, rerender } = renderHook(() => useSelectedTeam(user));
    expect(result.current[0]).toBe("first");
    expect(localStorage.getItem(key)).toBe("first");
    search = "team=second";
    rerender();
    expect(result.current[0]).toBe("second");
    expect(localStorage.getItem(key)).toBe("second");
  });

  it("ignores saved teams the user no longer belongs to", () => {
    localStorage.setItem(key, "removed-team");
    const { result } = renderHook(() => useSelectedTeam(user));
    expect(result.current[0]).toBe("first");
    expect(localStorage.getItem(key)).toBe("first");
  });

  it("keeps preferences separate for different users", () => {
    localStorage.setItem(key, "second");
    const { result } = renderHook(() =>
      useSelectedTeam({ ...user, email: "other@example.com" }),
    );
    expect(result.current[0]).toBe("first");
    expect(localStorage.getItem(key)).toBe("second");
  });

  it("does not replace the saved choice with the SSR default during hydration", () => {
    localStorage.setItem(key, "second");
    function Probe() {
      const [team] = useSelectedTeam(user);
      return <span>{team}</span>;
    }
    const container = document.createElement("div");
    container.innerHTML = renderToString(<Probe />);
    expect(container.textContent).toBe("first");
    const write = vi.spyOn(Storage.prototype, "setItem");
    render(<Probe />, { container, hydrate: true });
    expect(container.textContent).toBe("second");
    expect(write).not.toHaveBeenCalledWith(key, "first");
    expect(localStorage.getItem(key)).toBe("second");
  });

  it("continues to honor URL selection if browser storage is blocked", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("Blocked", "SecurityError");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Blocked", "SecurityError");
    });
    search = "team=second";
    const { result } = renderHook(() => useSelectedTeam(user));
    expect(result.current[0]).toBe("second");
    act(() => result.current[1]("first"));
    expect(replace).toHaveBeenCalled();
  });

  it("does not overwrite another tab's preference when this tab has an explicit URL", () => {
    search = "team=first";
    const { result } = renderHook(() => useSelectedTeam(user));
    act(() => {
      localStorage.setItem(key, "second");
      window.dispatchEvent(
        new StorageEvent("storage", { key, newValue: "second" }),
      );
    });
    expect(result.current[0]).toBe("first");
    expect(localStorage.getItem(key)).toBe("second");
  });
});
