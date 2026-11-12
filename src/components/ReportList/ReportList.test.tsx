import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
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
    url: "https://nav.no/alpha",
    teamId: "t1",
    teamName: "Team Alpha",
    date: "2026-01-01",
    isPartOfNavNo: true,
    reportType: "SINGLE",
  },
  {
    id: "r2",
    title: "Samlet rapport",
    url: "https://example.com/samlet",
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

  it("searches both titles and URLs, ignoring case and surrounding spaces", () => {
    render(<ReportList reports={reports} />);
    fireEvent.change(screen.getByLabelText("Finn rapport"), {
      target: { value: " NAV.NO/ALPHA " },
    });
    expect(
      screen.getByRole("link", { name: "Rapport Alpha" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Samlet rapport" }),
    ).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Finn rapport"), {
      target: { value: "samlet rapport" },
    });
    expect(
      screen.getByRole("link", { name: "Samlet rapport" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Rapport Alpha" }),
    ).not.toBeInTheDocument();
  });

  it("paginates 100+ reports, resetting to page one after filtering", async () => {
    const many = Array.from({ length: 103 }, (_, index) => ({
      ...reports[0],
      id: `r${index}`,
      title: `Report ${index}`,
      url: `https://example.com/report/${index}`,
    }));
    const { container } = render(<ReportList reports={many} />);
    expect(within(screen.getByRole("table")).getAllByRole("row")).toHaveLength(
      26,
    );
    fireEvent.click(
      within(
        screen.getByRole("navigation", { name: "Sider med rapporter" }),
      ).getByRole("button", { name: "5" }),
    );
    expect(within(screen.getByRole("table")).getAllByRole("row")).toHaveLength(
      4,
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "101–103 av 103 rapporter",
    );
    expect((await axe(container)).violations).toEqual([]);
    fireEvent.change(screen.getByLabelText("Finn rapport"), {
      target: { value: "example.com/report/7" },
    });
    expect(within(screen.getByRole("table")).getAllByRole("row")).toHaveLength(
      12,
    );
    expect(
      screen.queryByRole("navigation", { name: "Sider med rapporter" }),
    ).not.toBeInTheDocument();
  });
});
