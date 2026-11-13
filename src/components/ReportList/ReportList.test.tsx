import { beforeEach, describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { axe } from "vitest-axe";
import ReportList from "./ReportList";
import type { ReportSummary } from "@src/types";

const navigation = vi.hoisted(() => ({ search: "", replace: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: navigation.replace, push: vi.fn() }),
  usePathname: () => "/reports",
  useSearchParams: () => new URLSearchParams(navigation.search),
}));
vi.mock("@components/teamDashboard/useReportStatuses", () => ({
  useReportStatuses: (items: ReportSummary[]) => ({
    data: Object.fromEntries(
      items.map((item) => [
        item.id,
        {
          metadata: {
            url: `https://details.example/${item.id}`,
            created: item.date,
            notes:
              item.id === "r1"
                ? "Første linje\n  Andre linje <b>tekst</b>"
                : "   ",
          },
          data: {
            total: 1,
            counts: {
              COMPLIANT: 1,
              NON_COMPLIANT: 0,
              NOT_TESTED: 0,
              NOT_APPLICABLE: 0,
            },
          },
        },
      ]),
    ),
    retry: vi.fn(),
  }),
}));
beforeEach(() => {
  navigation.search = "";
  navigation.replace.mockReset();
});

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
  it("shows short dates in grid cells and long dates in details", () => {
    const date = "2026-11-13T12:00:00";
    render(<ReportList reports={[{ ...reports[0], date }]} />);
    const row = within(screen.getByRole("table")).getAllByRole("row")[1];
    const dates = row.querySelectorAll("time");
    expect(dates).toHaveLength(2);
    for (const element of dates) {
      expect(element).toHaveAttribute("datetime", date);
      expect(element).toHaveAttribute("title", date);
      expect(element).toHaveTextContent("13.11.2026");
    }
    fireEvent.click(within(row).getByRole("button", { name: "Vis detaljer" }));
    expect(screen.getAllByText("13. november 2026")).toHaveLength(2);
  });

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
    expect(screen.getByText("101–103 av 103 rapporter")).toBeInTheDocument();
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

  it("filters across all pages by team and URL from loaded details", () => {
    const many = Array.from({ length: 60 }, (_, index) => ({
      ...reports[0],
      id: `item${index}`,
      title: `Rapport ${index}`,
      url: undefined,
      teamId: index === 57 ? "t2" : "t1",
      teamName: index === 57 ? "Team Beta" : "Team Alpha",
    }));
    render(<ReportList reports={many} />);
    fireEvent.click(
      within(
        screen.getByRole("navigation", { name: "Sider med rapporter" }),
      ).getByRole("button", { name: "2" }),
    );
    fireEvent.change(screen.getByRole("combobox", { name: "Team" }), {
      target: { value: "t2" },
    });
    expect(
      screen.getByRole("link", { name: "Rapport 57" }),
    ).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Finn rapport"), {
      target: { value: "details.example/item57" },
    });
    expect(
      screen.getByRole("link", { name: "Rapport 57" }),
    ).toBeInTheDocument();
    fireEvent.change(screen.getByRole("combobox", { name: "Team" }), {
      target: { value: "t1" },
    });
    expect(
      screen.queryByRole("link", { name: "Rapport 57" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("Ingen rapporter passer med søket"),
    ).toBeInTheDocument();
  });

  it.each([
    ["title:desc", "Samlet rapport"],
    ["teamName:desc", "Samlet rapport"],
    ["date:desc", "Samlet rapport"],
    ["title:asc", "Rapport Alpha"],
  ])("honors existing sort link %s", (sort, first) => {
    navigation.search = `sort=${sort}`;
    render(<ReportList reports={reports} />);
    expect(
      within(screen.getByRole("table")).getAllByRole("row")[1],
    ).toHaveTextContent(first);
  });

  it("shows shared status and safely renders nonempty notes in details", () => {
    render(<ReportList reports={reports} />);
    const table = screen.getByRole("table");
    expect(
      within(table).getByRole("columnheader", { name: "Oppfylt" }),
    ).toBeInTheDocument();
    fireEvent.click(
      within(table).getAllByRole("button", { name: "Vis detaljer" })[0],
    );
    const notes = screen.getByText(/Første linje/);
    expect(notes.textContent).toBe("Første linje\n  Andre linje <b>tekst</b>");
    expect(notes.querySelector("b")).toBeNull();
    expect(notes.closest("dl")?.parentElement).toHaveAttribute("tabindex", "-1");
    expect(screen.getByText("Rapporttype")).toBeVisible();
    fireEvent.click(
      within(table).getByRole("button", { name: "Skjul detaljer" }),
    );
    fireEvent.click(
      within(table).getAllByRole("button", { name: "Vis detaljer" })[1],
    );
    expect(screen.queryByText("Notater")).not.toBeInTheDocument();
  });

  it("resets pagination when the dataset changes", () => {
    const many = Array.from({ length: 60 }, (_, index) => ({
      ...reports[0],
      id: `x${index}`,
      title: `Rapport ${index}`,
    }));
    const { rerender } = render(<ReportList reports={many} />);
    fireEvent.click(
      within(
        screen.getByRole("navigation", { name: "Sider med rapporter" }),
      ).getByRole("button", { name: "3" }),
    );
    rerender(<ReportList reports={many.slice(0, 40)} />);
    expect(screen.getByRole("link", { name: "Rapport 0" })).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Rapport 30" }),
    ).not.toBeInTheDocument();
  });

  it("persists a new sort in the URL and resets pagination", () => {
    navigation.replace.mockImplementation((url: string) => {
      navigation.search = url.split("?")[1] ?? "";
    });
    const many = Array.from({ length: 60 }, (_, index) => ({
      ...reports[0],
      id: `sort${index}`,
      title: `Rapport ${String(index).padStart(2, "0")}`,
    }));
    render(<ReportList reports={many} />);
    fireEvent.click(
      within(
        screen.getByRole("navigation", { name: "Sider med rapporter" }),
      ).getByRole("button", { name: "3" }),
    );
    fireEvent.click(
      within(screen.getByRole("table")).getByRole("button", {
        name: "Rapport",
      }),
    );
    expect(navigation.replace).toHaveBeenCalledWith(
      "/reports?sort=title%3Aasc",
      { scroll: false },
    );
    expect(screen.getByRole("link", { name: "Rapport 00" })).toBeVisible();
  });
});
