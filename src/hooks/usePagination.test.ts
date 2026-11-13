import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { usePagination } from "./usePagination";

describe("usePagination", () => {
  const items = Array.from({ length: 60 }, (_, index) => index);

  it("does not revive the old page when a filter is cleared", () => {
    const { result, rerender } = renderHook(
      ({ data, key }) => usePagination(data, key),
      { initialProps: { data: items, key: "" } },
    );
    act(() => result.current.onPageChange(3));
    expect(result.current.page).toBe(3);
    rerender({ data: [59], key: "59" });
    expect(result.current.page).toBe(1);
    rerender({ data: items, key: "" });
    expect(result.current.page).toBe(1);
    expect(result.current.items[0]).toBe(0);
  });

  it("does not revive an out-of-range page after the data grows again", () => {
    const { result, rerender } = renderHook(
      ({ data }) => usePagination(data, "same-filter"),
      { initialProps: { data: items } },
    );
    act(() => result.current.onPageChange(3));
    rerender({ data: items.slice(0, 10) });
    expect(result.current.page).toBe(1);
    rerender({ data: items });
    expect(result.current.page).toBe(1);
  });
});
