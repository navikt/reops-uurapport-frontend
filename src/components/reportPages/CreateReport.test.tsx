import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { axe } from "vitest-axe";
import CreateReport from "./CreateReport";
import type { Report } from "@src/types";

vi.mock("@src/services/reportServices", () => ({
  updateReport: vi.fn().mockResolvedValue({}),
  updateAggregatedReport: vi.fn().mockResolvedValue({}),
}));
vi.mock("@components/Modal/deleteReportModal/DeleteReportModal", () => ({
  default: () => null,
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  usePathname: () => "/reports/r1",
  useSearchParams: () => new URLSearchParams(),
}));

const report = {
  reportId: "r1",
  descriptiveName: "Testrapport",
  url: "https://example.nav.no",
  notes: "Noen notater",
  isPartOfNavNo: false,
  hasWriteAccess: true,
  successCriteria: [
    {
      number: "1.1.1",
      name: "Ikke-tekstlig innhold",
      description: "Tekstalternativ for ikke-tekstlig innhold.",
      wcagUrl: "https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html",
      status: "NOT_TESTED",
    },
  ],
} as unknown as Report;

describe("CreateReport a11y", () => {
  it("has no axe violations (criteria tab)", async () => {
    const { container } = render(
      <CreateReport report={report} reportType="SINGLE" isAdmin={false} />,
    );
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });

  it("has no axe violations (aggregated type)", async () => {
    const { container } = render(
      <CreateReport report={report} reportType="AGGREGATED" isAdmin={true} />,
    );
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
