import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { axe } from "vitest-axe";
import ReportList from "./ReportList";
import type { ReportSummary } from "@src/types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  usePathname: () => "/reports",
  useSearchParams: () => new URLSearchParams(),
}));

const reports: ReportSummary[] = [
  {
    id: "r1",
    title: "Rapport Alpha",
    teamId: "t1",
    teamName: "Team Alpha",
    date: "2026-01-01",
    isPartOfNavNo: true,
    reportType: "SINGLE",
  },
  {
    id: "r2",
    title: "Samlet rapport",
    teamId: "t2",
    teamName: "Team Beta",
    date: "2026-02-01",
    isPartOfNavNo: false,
    reportType: "AGGREGATED",
  },
];

describe("ReportList a11y", () => {
  it("has no axe violations", async () => {
    const { container } = render(<ReportList reports={reports} />);
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
