import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useQueryParam, useQueryParamList } from "./useQueryParam";

const replaceMock = vi.fn();
const pushMock = vi.fn();
let currentSearch = "";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock, push: pushMock }),
  usePathname: () => "/teams/abc",
  useSearchParams: () => new URLSearchParams(currentSearch),
}));

beforeEach(() => {
  replaceMock.mockClear();
  pushMock.mockClear();
  currentSearch = "";
});

describe("useQueryParam", () => {
  it("returns default when param absent", () => {
    const { result } = renderHook(() => useQueryParam("tab", "teamView"));
    expect(result.current[0]).toBe("teamView");
  });

  it("returns param value when present in URL", () => {
    currentSearch = "tab=myReports";
    const { result } = renderHook(() => useQueryParam("tab", "teamView"));
    expect(result.current[0]).toBe("myReports");
  });

  it("writes param via router.replace by default", () => {
    const { result } = renderHook(() => useQueryParam("tab", "teamView"));
    act(() => result.current[1]("myReports"));
    expect(replaceMock).toHaveBeenCalledWith("/teams/abc?tab=myReports", {
      scroll: false,
    });
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("uses router.push when history=push", () => {
    const { result } = renderHook(() =>
      useQueryParam("tab", "teamView", { history: "push" }),
    );
    act(() => result.current[1]("myReports"));
    expect(pushMock).toHaveBeenCalledWith("/teams/abc?tab=myReports", {
      scroll: false,
    });
  });

  it("removes param when set to default value", () => {
    currentSearch = "tab=myReports";
    const { result } = renderHook(() => useQueryParam("tab", "teamView"));
    act(() => result.current[1]("teamView"));
    expect(replaceMock).toHaveBeenCalledWith("/teams/abc", { scroll: false });
  });

  it("removes param when set to undefined", () => {
    currentSearch = "sort=title:asc";
    const { result } = renderHook(() => useQueryParam("sort", ""));
    act(() => result.current[1](undefined));
    expect(replaceMock).toHaveBeenCalledWith("/teams/abc", { scroll: false });
  });

  it("preserves other params", () => {
    currentSearch = "team=t1&tab=myReports";
    const { result } = renderHook(() => useQueryParam("tab", "teamView"));
    act(() => result.current[1]("teamView"));
    const url = replaceMock.mock.calls[0][0] as string;
    expect(url).toContain("team=t1");
    expect(url).not.toContain("tab=");
  });
});

describe("useQueryParamList", () => {
  it("returns empty list when param absent", () => {
    const { result } = renderHook(() => useQueryParamList("filter"));
    expect(result.current[0]).toEqual([]);
  });

  it("parses comma-separated values", () => {
    currentSearch = "filter=COMPLIANT,NOT_TESTED";
    const { result } = renderHook(() => useQueryParamList("filter"));
    expect(result.current[0]).toEqual(["COMPLIANT", "NOT_TESTED"]);
  });

  it("joins values with comma on set", () => {
    const { result } = renderHook(() => useQueryParamList("filter"));
    act(() => result.current[1](["COMPLIANT", "NOT_TESTED"]));
    expect(replaceMock).toHaveBeenCalledWith(
      "/teams/abc?filter=COMPLIANT%2CNOT_TESTED",
      { scroll: false },
    );
  });

  it("removes param when list emptied", () => {
    currentSearch = "filter=COMPLIANT";
    const { result } = renderHook(() => useQueryParamList("filter"));
    act(() => result.current[1]([]));
    expect(replaceMock).toHaveBeenCalledWith("/teams/abc", { scroll: false });
  });
});
