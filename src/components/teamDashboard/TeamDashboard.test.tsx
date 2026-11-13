import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import useSWR from "swr";
import TeamDashboard from "./TeamDashboard";
import ReportStatus, { summarizeStatus } from "./ReportStatus";
import TeamReportList from "./TeamReportList";
import { loadReportStatuses } from "./useReportStatuses";
import styles from "./TeamDashboard.module.css";
import type { ReportSummary } from "@src/types";

vi.mock("swr", () => ({ default: vi.fn() }));
vi.mock("@components/Modal/createReportModal/CreateReportModal", () => ({
  default: () => <button>Opprett en ny rapport</button>,
}));
vi.mock("@components/Modal/TeamModals/EditTeamModal", () => ({
  default: () => <button>Rediger</button>,
}));

const reports: ReportSummary[] = [
  {
    id: "first",
    title: "Søknaden",
    teamId: "team",
    teamName: "Team",
    date: "2026-01-01",
    isPartOfNavNo: true,
  },
  {
    id: "second",
    title: "Oversikten",
    teamId: "team",
    teamName: "Team",
    date: "2026-02-01",
    isPartOfNavNo: false,
  },
  {
    id: "combined",
    title: "Samlet",
    teamId: "team",
    teamName: "Team",
    date: "2026-03-01",
    isPartOfNavNo: true,
    reportType: "AGGREGATED",
  },
];
const detail = {
  successCriteria: [
    { status: "COMPLIANT" },
    { status: "NON_COMPLIANT" },
    { status: "NOT_APPLICABLE" },
    { status: "NOT_TESTED" },
    { status: "UNKNOWN" },
    {},
  ],
};
const reload = vi.fn();
let list: ReportSummary[];
let failingUrl: string | undefined;
let loadingUrl: string | undefined;
let reportDetail: typeof detail | undefined;
let detailsById: Record<string, typeof detail>;
let createdById: Record<string, string | undefined>;
let notesById: Record<string, string>;

beforeEach(() => {
  vi.clearAllMocks();
  list = reports;
  failingUrl = undefined;
  loadingUrl = undefined;
  reportDetail = detail;
  detailsById = {};
  notesById = {};
  createdById = Object.fromEntries(
    reports.map((report) => [report.id, report.date]),
  );
  vi.mocked(useSWR).mockImplementation(((
    key: { url?: string; reports?: { id: string; url: string }[] } | null,
  ) => ({
    ...(key?.reports
      ? {
          data: Object.fromEntries(
            key.reports.map(({ id, url }) => [
              id,
              {
                data: reportDetail
                  ? summarizeStatus(detailsById[id] ?? reportDetail)
                  : undefined,
                error: Boolean(failingUrl && url.endsWith(failingUrl)),
                metadata: reportDetail
                  ? {
                      created: createdById[id],
                      lastChanged: "2026-11-12",
                      url: "https://example.com/page",
                      notes: notesById[id],
                    }
                  : undefined,
              },
            ]),
          ),
          mutate: reload,
        }
      : {
          data: key?.url?.endsWith("/teams/team/reports")
            ? list
            : key?.url?.endsWith("/teams/team")
              ? {
                  name: "Team",
                  email: "team@example.com",
                  members: ["member@example.com"],
                }
              : reportDetail,
          error:
            failingUrl && key?.url?.endsWith(failingUrl)
              ? new Error("Unavailable")
              : undefined,
          isLoading: Boolean(loadingUrl && key?.url?.endsWith(loadingUrl)),
          isValidating: false,
          mutate: reload,
        }),
  })) as unknown as typeof useSWR);
});

describe("TeamDashboard", () => {
  it("keeps the summary section in place while chart data loads", () => {
    reportDetail = undefined;
    const { rerender } = render(<TeamDashboard teamId="team" isMyTeam />);
    const summary = screen.getByRole("region", { name: "Samlet kravstatus" });
    expect(summary).toHaveClass(styles.summary);
    expect(summary).toHaveAttribute("aria-busy", "true");
    expect(
      within(summary).getByTitle("Laster samlet kravstatus"),
    ).toBeInTheDocument();

    reportDetail = detail;
    rerender(<TeamDashboard teamId="team" isMyTeam />);
    expect(screen.getByRole("region", { name: "Samlet kravstatus" })).toBe(
      summary,
    );
    expect(summary).not.toHaveAttribute("aria-busy", "true");
    expect(within(summary).getByText("Krav i 2 enkeltrapporter")).toBeVisible();
  });

  it("shows every report together, newest first, without decorative copy or counters", () => {
    render(<TeamDashboard teamId="team" isMyTeam />);
    const reportLinks = screen
      .getAllByRole("table")
      .flatMap((table) => within(table).getAllByRole("link"));
    expect(
      screen
        .getAllByRole("table")
        .map((table) => table.getAttribute("aria-label")),
    ).toEqual(["Samlerapporter", "Enkeltrapporter"]);
    expect(reportLinks.map((link) => link.textContent)).toEqual([
      "Samlet",
      "Oversikten",
      "Søknaden",
    ]);
    expect(screen.queryByText("Teamets arbeidsrom")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Tilgjengelighetsarbeidet"),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/Se hva som er testet/)).not.toBeInTheDocument();
    expect(
      screen.queryByText("Rapporter", { selector: "dt" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Samlerapporter", { selector: "dt" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Samlet" })).toHaveAttribute(
      "href",
      "/reports/aggregated/combined",
    );
  });

  it("filters by title and resets an empty search result", () => {
    render(<TeamDashboard teamId="team" isMyTeam />);
    fireEvent.change(screen.getByLabelText("Finn rapport"), {
      target: { value: " SØKNAD " },
    });
    expect(within(screen.getByRole("table")).getAllByRole("link")).toHaveLength(
      1,
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Viser 1 av 3 rapporter",
    );
    fireEvent.change(screen.getByLabelText("Finn rapport"), {
      target: { value: "missing" },
    });
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Nullstill søket" }));
    expect(
      screen
        .getAllByRole("table")
        .flatMap((table) => within(table).getAllByRole("link")),
    ).toHaveLength(3);
  });

  it("matches URL from both report summaries and loaded details", () => {
    const { rerender } = render(
      <TeamReportList
        reports={[{ ...reports[0], url: "https://nav.no/soknad" }, reports[1]]}
        query=" NAV.NO/SOKNAD "
      />,
    );
    expect(screen.getByRole("link", { name: "Søknaden" })).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Oversikten" }),
    ).not.toBeInTheDocument();
    rerender(<TeamReportList reports={reports} query="example.com/page" />);
    expect(within(screen.getByRole("table")).getAllByRole("link")).toHaveLength(
      3,
    );
  });

  it("paginates team reports and resets the page after searching or sorting", () => {
    const many = Array.from({ length: 60 }, (_, index) => ({
      ...reports[0],
      id: `r${index}`,
      title: `Report ${String(index).padStart(2, "0")}`,
      url: `https://example.com/${index}`,
    }));
    const { rerender } = render(<TeamReportList reports={many} />);
    const table = () => screen.getByRole("table");
    expect(within(table()).getAllByRole("link")).toHaveLength(25);
    fireEvent.click(
      within(
        screen.getByRole("navigation", { name: "Sider med rapporter" }),
      ).getByRole("button", { name: "2" }),
    );
    expect(screen.getByRole("link", { name: "Report 25" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Rapport" }));
    expect(screen.getByRole("link", { name: "Report 00" })).toBeInTheDocument();
    fireEvent.click(
      within(
        screen.getByRole("navigation", { name: "Sider med rapporter" }),
      ).getByRole("button", { name: "3" }),
    );
    expect(within(table()).getAllByRole("link")).toHaveLength(10);
    rerender(<TeamReportList reports={many} query="example.com/7" />);
    expect(within(table()).getAllByRole("link")).toHaveLength(1);
    expect(screen.getByRole("link", { name: "Report 07" })).toBeInTheDocument();
    expect(
      screen.queryByRole("navigation", { name: "Sider med rapporter" }),
    ).not.toBeInTheDocument();
  });

  it("sums single reports only and keeps totals independent of the search", () => {
    render(<TeamDashboard teamId="team" isMyTeam />);
    const summary = screen.getByRole("region", { name: "Samlet kravstatus" });
    const count = (label: string) =>
      within(summary).getByText(label).closest("div")!.querySelector("dd")!
        .textContent;
    expect(count("Oppfylt")).toBe("2");
    expect(count("Ikke oppfylt")).toBe("2");
    expect(count("Ikke testet")).toBe("6");
    expect(count("Ikke aktuelt")).toBe("2");
    fireEvent.change(screen.getByLabelText("Finn rapport"), {
      target: { value: "Søknaden" },
    });
    expect(count("Oppfylt")).toBe("2");
    expect(count("Ikke testet")).toBe("6");
  });

  it("marks partial summaries when a report fails instead of treating it as zero", () => {
    failingUrl = "/reports/first";
    render(<TeamDashboard teamId="team" isMyTeam />);
    const summary = screen.getByRole("region", { name: "Samlet kravstatus" });
    expect(
      within(summary).getByText("Krav i 1 av 2 enkeltrapporter"),
    ).toBeInTheDocument();
    expect(
      within(summary).getByText("Mangler status for 1 rapport."),
    ).toBeInTheDocument();
  });

  it("sorts reports alphabetically", () => {
    render(<TeamDashboard teamId="team" isMyTeam />);
    const table = screen.getByRole("table", { name: "Enkeltrapporter" });
    fireEvent.click(within(table).getByRole("button", { name: "Rapport" }));
    expect(
      within(table)
        .getAllByRole("link")
        .map((link) => link.textContent),
    ).toEqual(["Oversikten", "Søknaden"]);
  });

  it("sorts by actual creation date, never by last changed, with unknown dates last", () => {
    createdById = { first: "2030-01-01", second: "2020-01-01" };
    render(<TeamReportList reports={reports} />);
    const names = () =>
      within(screen.getByRole("table"))
        .getAllByRole("link")
        .map((link) => link.textContent);
    expect(names()).toEqual(["Søknaden", "Oversikten", "Samlet"]);
    fireEvent.click(screen.getByRole("button", { name: "Opprettet" }));
    fireEvent.click(screen.getByRole("button", { name: "Opprettet" }));
    expect(names()).toEqual(["Oversikten", "Søknaden", "Samlet"]);
    expect(screen.getByLabelText("Opprettelsesdato ukjent")).toHaveTextContent(
      "—",
    );
  });

  it("keeps metadata collapsed and shows nav.no membership in its own column", () => {
    render(<TeamReportList reports={[reports[0]]} />);
    const table = screen.getByRole("table");
    expect(table).toHaveAttribute("data-layout", "fixed");
    expect(table).toHaveAttribute("data-truncate-content", "true");
    expect(
      screen.getByRole("columnheader", { name: "Del av nav.no" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Ja" })).toBeInTheDocument();
    expect(screen.queryByText("Nettadresse")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Vis detaljer" }));
    expect(screen.getByText("Nettadresse")).toBeVisible();
    expect(screen.getByText("https://example.com/page")).toBeVisible();
    expect(screen.getByText("Enkeltrapport")).toBeVisible();
    expect(screen.getByText("Sist endret")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Skjul detaljer" }));
    expect(screen.queryByText("Nettadresse")).not.toBeInTheDocument();
  });

  it.each([
    ["Oppfylt", "COMPLIANT"],
    ["Ikke oppfylt", "NON_COMPLIANT"],
    ["Ikke testet", "NOT_TESTED"],
    ["Ikke aktuelt", "NOT_APPLICABLE"],
  ])(
    "sorts %s numerically in both directions, with failed statuses last",
    (label, status) => {
      detailsById.first = {
        successCriteria: Array.from({ length: 2 }, () => ({ status })),
      };
      detailsById.second = {
        successCriteria: Array.from({ length: 10 }, () => ({ status })),
      };
      failingUrl = "/reports/aggregated/combined";
      render(<TeamReportList reports={reports} />);
      const names = () =>
        within(screen.getByRole("table"))
          .getAllByRole("link")
          .map((link) => link.textContent);
      fireEvent.click(screen.getByRole("button", { name: label }));
      expect(names()).toEqual(["Søknaden", "Oversikten", "Samlet"]);
      fireEvent.click(screen.getByRole("button", { name: label }));
      expect(names()).toEqual(["Oversikten", "Søknaden", "Samlet"]);
    },
  );

  it("shows an empty state without offering edits to nonmembers", () => {
    list = [];
    render(<TeamDashboard teamId="team" isMyTeam={false} />);
    expect(
      screen.getByText("Teamet har ingen rapporter ennå."),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Opprett en ny rapport" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Rediger" }),
    ).not.toBeInTheDocument();
  });

  it("offers retry when the report list fails", () => {
    failingUrl = "/teams/team/reports";
    render(<TeamDashboard teamId="team" isMyTeam />);
    expect(screen.getByText("Kunne ikke laste teamet")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Prøv igjen" }));
    expect(reload).toHaveBeenCalledTimes(2);
  });

  it("shows loading rather than an empty workspace while fetching", () => {
    loadingUrl = "/teams/team/reports";
    render(<TeamDashboard teamId="team" isMyTeam />);
    expect(screen.getByTitle("Laster teamets rapporter")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("has no automated accessibility violations", async () => {
    const { container } = render(<TeamDashboard teamId="team" isMyTeam />);
    expect((await axe(container)).violations).toEqual([]);
    fireEvent.click(
      within(screen.getByRole("table", { name: "Enkeltrapporter" })).getByRole(
        "button",
        { name: "Vis alle rader" },
      ),
    );
    expect((await axe(container)).violations).toEqual([]);
  });

  it("keeps contact, members and team editing visible", () => {
    render(<TeamDashboard teamId="team" isMyTeam />);
    const management = screen.getByRole("group", {
      name: "Teamadministrasjon",
    });
    expect(
      screen.getByRole("link", { name: "team@example.com" }),
    ).toHaveAttribute("href", "mailto:team@example.com");
    expect(screen.getByText("member@example.com")).toBeVisible();
    expect(
      within(management).getByRole("button", { name: "Rediger" }),
    ).toBeVisible();
  });

  it("hides samlerapporter when the team has none", () => {
    list = reports.filter((report) => report.reportType !== "AGGREGATED");
    render(<TeamDashboard teamId="team" isMyTeam />);
    expect(
      screen.queryByRole("heading", { name: "Samlerapporter" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("table", { name: "Enkeltrapporter" }),
    ).toBeInTheDocument();
  });

  it("keeps pagination separate for samlerapporter and enkeltrapporter", () => {
    const many = [
      ...Array.from({ length: 26 }, (_, index) => ({
        ...reports[2],
        id: `a${index}`,
        title: `Combined ${index}`,
      })),
      ...Array.from({ length: 30 }, (_, index) => ({
        ...reports[0],
        id: `s${index}`,
        title: `Single ${index}`,
      })),
    ];
    render(<TeamReportList reports={many} groupByType />);
    const aggregated = screen.getByRole("table", { name: "Samlerapporter" });
    const singles = screen.getByRole("table", { name: "Enkeltrapporter" });
    expect(within(aggregated).getAllByRole("link")).toHaveLength(25);
    expect(within(singles).getAllByRole("link")).toHaveLength(25);
    fireEvent.click(
      within(
        screen.getByRole("navigation", { name: "Sider med samlerapporter" }),
      ).getByRole("button", { name: "2" }),
    );
    expect(within(aggregated).getAllByRole("link")).toHaveLength(1);
    expect(within(singles).getAllByRole("link")).toHaveLength(25);
    expect(
      within(singles).getByRole("link", { name: "Single 0" }),
    ).toBeInTheDocument();
  });

  it("hides redundant type in grouped details and shows only nonempty notes", () => {
    notesById = { combined: "En linje\n  En annen", first: "  " };
    render(<TeamReportList reports={reports} groupByType />);
    const aggregated = screen.getByRole("table", { name: "Samlerapporter" });
    fireEvent.click(
      within(aggregated).getByRole("button", { name: "Vis detaljer" }),
    );
    expect(within(aggregated).getByText("Notater")).toBeVisible();
    expect(within(aggregated).getByText(/En linje/).textContent).toBe(
      "En linje\n  En annen",
    );
    expect(
      within(aggregated).queryByText("Rapporttype"),
    ).not.toBeInTheDocument();
    const singles = screen.getByRole("table", { name: "Enkeltrapporter" });
    fireEvent.click(
      within(singles).getByRole("button", { name: "Vis alle rader" }),
    );
    expect(within(singles).queryByText("Rapporttype")).not.toBeInTheDocument();
    expect(within(singles).queryByText("Notater")).not.toBeInTheDocument();
  });
});

describe("ReportStatus", () => {
  it("counts the API's NON_COMPLIANT answers as failures, not untested", () => {
    const successCriteria = [
      ...Array.from({ length: 5 }, () => ({ status: "COMPLIANT" })),
      ...Array.from({ length: 13 }, () => ({ status: "NON_COMPLIANT" })),
      ...Array.from({ length: 26 }, () => ({ status: "NOT_TESTED" })),
      ...Array.from({ length: 5 }, () => ({ status: "NOT_APPLICABLE" })),
    ];
    expect(summarizeStatus({ successCriteria })).toEqual({
      total: 49,
      counts: {
        COMPLIANT: 5,
        NON_COMPLIANT: 13,
        NOT_TESTED: 26,
        NOT_APPLICABLE: 5,
      },
    });
  });

  it("treats unknown spellings as untested rather than valid failures", () => {
    expect(
      summarizeStatus({
        successCriteria: [
          { status: "NOT_COMPLIANT" },
          { status: "NON_COMPLIANT" },
          { status: "UNKNOWN" },
          {},
        ],
      }).counts,
    ).toEqual({
      COMPLIANT: 0,
      NON_COMPLIANT: 1,
      NOT_TESTED: 3,
      NOT_APPLICABLE: 0,
    });
  });

  it("counts every status, treating missing or unknown values as untested", () => {
    render(<TeamReportList reports={[reports[0]]} />);
    expect(
      screen.queryByRole("columnheader", { name: "Vurdert" }),
    ).not.toBeInTheDocument();
    const row = screen.getByRole("link", { name: "Søknaden" }).closest("tr")!;
    const cells = within(row).getAllByRole("cell");
    expect(cells.slice(2, 6).map((cell) => cell.textContent)).toEqual([
      "1",
      "1",
      "3",
      "1",
    ]);
    for (const label of [
      "Oppfylt",
      "Ikke oppfylt",
      "Ikke testet",
      "Ikke aktuelt",
    ]) {
      expect(
        screen.getByRole("columnheader", { name: label }),
      ).toBeInTheDocument();
    }
  });

  it("keeps report links usable when status fails", () => {
    failingUrl = "/reports/first";
    render(<TeamReportList reports={[reports[0]]} />);
    expect(screen.getByRole("link", { name: "Søknaden" })).toHaveAttribute(
      "href",
      "/reports/first",
    );
    fireEvent.click(screen.getByRole("button", { name: "Vis detaljer" }));
    expect(
      screen.getByText(/Kunne ikke laste rapportdetaljer og kravstatus/),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Prøv igjen" }));
    expect(reload).toHaveBeenCalledOnce();
  });

  it("does not imply a report with no criteria is complete", () => {
    reportDetail = { successCriteria: [] };
    render(
      <ReportStatus
        report={reports[0]}
        column="COMPLIANT"
        status={{ data: summarizeStatus(reportDetail) }}
      />,
    );
    expect(
      screen.getByLabelText("Ingen testkriterier tilgjengelig"),
    ).toBeInTheDocument();
    expect(screen.queryByText("100 %")).not.toBeInTheDocument();
  });

  it("shows a loading state while the report status is unavailable", () => {
    reportDetail = undefined;
    render(<ReportStatus report={reports[0]} column="COMPLIANT" />);
    expect(
      screen.getByTitle("Laster Oppfylt for Søknaden"),
    ).toBeInTheDocument();
  });

  it("does not show a false zero in status columns when loading fails", () => {
    failingUrl = "/reports/first";
    render(
      <ReportStatus
        report={reports[0]}
        column="NON_COMPLIANT"
        status={{ error: true }}
      />,
    );
    expect(screen.getByLabelText("Kunne ikke laste status")).toHaveTextContent(
      "—",
    );
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it.each([
    "COMPLIANT",
    "NON_COMPLIANT",
    "NOT_TESTED",
    "NOT_APPLICABLE",
  ] as const)("colors %s counts, including zero", (column) => {
    const status = {
      data: summarizeStatus({ successCriteria: [{ status: "COMPLIANT" }] }),
    };
    const { container } = render(
      <ReportStatus report={reports[0]} column={column} status={status} />,
    );
    expect(container.firstChild).toHaveClass(styles[column]);
  });

  it("keeps successful statuses when another report fails to load", async () => {
    const fetch = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            ...detail,
            created: "2024-01-03",
            lastChanged: "2026-11-12",
            url: "https://example.com",
            notes: "Tekst\nmed linjeskift",
          }),
        ),
      )
      .mockRejectedValueOnce(new Error("Unavailable"));
    try {
      const results = await loadReportStatuses({
        reports: [
          { id: "first", url: "/reports/first" },
          { id: "combined", url: "/reports/aggregated/combined" },
        ],
      });
      expect(results.first.data?.counts.NOT_TESTED).toBe(3);
      expect(results.first.metadata).toEqual({
        created: "2024-01-03",
        lastChanged: "2026-11-12",
        url: "https://example.com",
        notes: "Tekst\nmed linjeskift",
      });
      expect(results.combined).toEqual({ error: true });
      expect(fetch).toHaveBeenCalledTimes(2);
    } finally {
      fetch.mockRestore();
    }
  });
});
