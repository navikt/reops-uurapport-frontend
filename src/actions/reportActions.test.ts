import { afterEach, describe, expect, it, vi } from "vitest";
import { getAllReports, getReports } from "./reportActions";

vi.mock("@src/utils/server/urls", () => ({ apiUrl: "https://api.example" }));
vi.mock("@src/utils/server/getAuthToken", () => ({
  getAuthToken: vi.fn().mockResolvedValue("token"),
}));
vi.mock("@src/utils/server/getOboToken", () => ({
  getOboToken: vi.fn().mockResolvedValue("obo"),
}));

afterEach(() => vi.restoreAllMocks());

describe("report list actions", () => {
  it("loads both types for all reports without changing the single-report source action", async () => {
    const fetch = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(
        async (url) =>
          new Response(
            JSON.stringify(
              String(url).endsWith("/aggregated")
                ? [{ id: "aggregate" }]
                : [{ id: "single" }],
            ),
          ),
      );
    expect(await getAllReports()).toEqual([
      { id: "single", reportType: "SINGLE" },
      { id: "aggregate", reportType: "AGGREGATED" },
    ]);
    expect(fetch.mock.calls.map(([url]) => url)).toEqual([
      "https://api.example/api/reports",
      "https://api.example/api/reports/aggregated",
    ]);
    fetch.mockClear();
    expect(await getReports()).toEqual([{ id: "single" }]);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toBe("https://api.example/api/reports");
  });

  it("does not silently return a partial list when either endpoint fails", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (url) =>
      String(url).endsWith("/aggregated")
        ? new Response(null, { status: 503 })
        : new Response("[]"),
    );
    await expect(getAllReports()).rejects.toThrow("503");
  });
});
