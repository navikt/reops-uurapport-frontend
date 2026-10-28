import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
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
vi.mock("@components/Modal/archiveReportModal/ArchiveReportModal", () => ({
  default: () => <button type="button">Arkiver rapport</button>,
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn(), refresh: vi.fn() }),
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
      wcagUrl:
        "https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html",
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

  it("shows archive banner, restore button and read-only fields when archived", async () => {
    const archived = {
      ...report,
      archive: {
        archivedAt: "2026-09-01T10:00:00.000Z",
        archivedBy: "bruker@nav.no",
        reason: "Tjenesten er lagt ned",
      },
    } as unknown as Report;
    const { container } = render(
      <CreateReport report={archived} reportType="SINGLE" isAdmin={false} />,
    );
    expect(screen.getByText("Denne rapporten er arkivert")).toBeTruthy();
    expect(screen.getByText(/Årsak: Tjenesten er lagt ned/)).toBeTruthy();
    expect(screen.getByRole("button", { name: /^Gjenopprett/ })).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: "Arkiver rapport" }),
    ).toBeNull();
    expect((await axe(container)).violations).toEqual([]);
  });

  it("offers archive (not restore) for a non-archived report with write access", () => {
    render(
      <CreateReport report={report} reportType="SINGLE" isAdmin={false} />,
    );
    expect(
      screen.getByRole("button", { name: "Arkiver rapport" }),
    ).toBeTruthy();
    expect(screen.queryByRole("button", { name: /^Gjenopprett/ })).toBeNull();
  });
});
