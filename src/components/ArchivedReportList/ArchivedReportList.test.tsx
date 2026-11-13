import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { axe } from "vitest-axe";
import ArchivedReportList from "./ArchivedReportList";
import type { ArchivedReportSummary } from "@src/types";

const refresh = vi.fn();
const loadDetails = vi.hoisted(() => vi.fn());
vi.mock("@components/teamDashboard/useReportStatuses", () => ({
  useReportStatuses: (items: { id: string }[]) => {
    loadDetails(items);
    return {
      data: {
        [items[0].id]: {
          metadata: {
            url: "https://example.nav.no",
            notes: "Notat\n  med linjeskift",
          },
        },
      },
      retry: vi.fn(),
    };
  },
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh, push: vi.fn(), replace: vi.fn() }),
}));
vi.mock("swr/immutable", () => ({
  default: (key: { url: string }) => ({
    data: key.url.endsWith("/admins")
      ? [
          { name: "Ada Admin", email: "ada@nav.no" },
          { name: null, email: "bo@nav.no" },
        ]
      : {
          contacts: [
            { navIdent: "Z1", fullName: "Kari Kontakt", role: "kontaktperson" },
          ],
          slackChannelId: null,
        },
  }),
}));
const unarchiveReport = vi.fn().mockResolvedValue(undefined);
const deleteReport = vi.fn().mockResolvedValue(undefined);
vi.mock("@src/services/reportServices", () => ({
  unarchiveReport: (...args: unknown[]) => unarchiveReport(...args),
  deleteReport: (...args: unknown[]) => deleteReport(...args),
}));

const reports: ArchivedReportSummary[] = [
  {
    id: "a1",
    title: "Gammel tjeneste",
    url: "https://example.nav.no",
    teamId: "t1",
    teamName: "Team Alfa",
    reportType: "SINGLE",
    archive: {
      archivedAt: "2026-09-01T10:00:00.000Z",
      archivedBy: "bruker@nav.no",
      reason: "Tjenesten er lagt ned",
    },
    canRestore: true,
  },
  {
    id: "a2",
    title: null,
    url: "https://example.nav.no/2",
    teamId: "",
    teamName: "",
    reportType: "AGGREGATED",
    archive: {
      archivedAt: "2026-09-02T10:00:00.000Z",
      archivedBy: "annen@nav.no",
      reason: null,
    },
    canRestore: false,
  },
];

describe("ArchivedReportList", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows archive dates in the short Norwegian format", () => {
    const report = {
      ...reports[0],
      archive: { ...reports[0].archive, archivedAt: "2026-11-13T12:00:00" },
    };
    render(<ArchivedReportList reports={[report]} isAdmin={false} />);
    const date = screen.getByText("13.11.2026");
    expect(date.tagName).toBe("TIME");
    expect(date).toHaveAttribute("datetime", report.archive.archivedAt);
    expect(date).toHaveAttribute("title", report.archive.archivedAt);
  });

  it("has no axe violations (user and admin)", async () => {
    for (const isAdmin of [false, true]) {
      const { container, unmount } = render(
        <ArchivedReportList reports={reports} isAdmin={isAdmin} />,
      );
      expect((await axe(container)).violations).toEqual([]);
      unmount();
    }
  });

  it("has no axe violations when empty", async () => {
    const { container } = render(
      <ArchivedReportList reports={[]} isAdmin={false} />,
    );
    expect((await axe(container)).violations).toEqual([]);
    expect(screen.getByText("Ingen rapporter er arkivert.")).toBeTruthy();
  });

  it("shows who to contact for permanent deletion to non-admins only", () => {
    const { unmount } = render(
      <ArchivedReportList reports={reports} isAdmin={false} />,
    );
    expect(screen.getByText(/Kari Kontakt/)).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: /Slett .* permanent/ }),
    ).toBeNull();
    unmount();

    render(<ArchivedReportList reports={reports} isAdmin={true} />);
    expect(screen.queryByText(/Kari Kontakt/)).toBeNull();
    expect(
      screen.getAllByRole("button", { name: /Slett .* permanent/ }),
    ).toHaveLength(2);
  });

  it("only offers restore when the user can restore", () => {
    render(<ArchivedReportList reports={reports} isAdmin={false} />);
    expect(
      screen.getAllByRole("button", { name: /^Gjenopprett/ }),
    ).toHaveLength(1);
  });

  it("restores a report and announces it", async () => {
    render(<ArchivedReportList reports={reports} isAdmin={false} />);
    expect(
      screen.getByRole("link", { name: "Tilbake til alle rapporter" }),
    ).toHaveAttribute("href", "/reports");
    fireEvent.click(
      screen.getByRole("button", { name: "Gjenopprett Gammel tjeneste" }),
    );
    expect(unarchiveReport).toHaveBeenCalledWith("a1");
    expect(
      await screen.findByText("«Gammel tjeneste» er gjenopprettet."),
    ).toBeInTheDocument();
    expect(refresh).toHaveBeenCalled();
    expect(
      screen.getByRole("heading", { level: 1, name: "Arkiverte rapporter" }),
    ).toHaveFocus();
  });

  it("requires two steps and a typed name before permanent delete", async () => {
    render(<ArchivedReportList reports={[reports[0]]} isAdmin={true} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Slett Gammel tjeneste permanent" }),
    );
    expect(deleteReport).not.toHaveBeenCalled();

    fireEvent.click(await screen.findByRole("button", { name: "Fortsett" }));
    const confirmButton = await screen.findByRole("button", {
      name: "Slett permanent",
    });
    expect((confirmButton as HTMLButtonElement).disabled).toBe(true);

    fireEvent.change(screen.getByLabelText(/Skriv «Gammel tjeneste»/), {
      target: { value: "Gammel tjeneste" },
    });
    expect((confirmButton as HTMLButtonElement).disabled).toBe(false);

    fireEvent.click(confirmButton);
    expect(deleteReport).toHaveBeenCalledWith("a1");
    expect(
      await screen.findByText("«Gammel tjeneste» er slettet."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("loads details only on expansion, including notes and type", async () => {
    const { container } = render(
      <ArchivedReportList reports={reports} isAdmin={false} />,
    );
    expect(loadDetails).not.toHaveBeenCalled();
    fireEvent.click(screen.getAllByRole("button", { name: "Vis detaljer" })[0]);
    expect(loadDetails).toHaveBeenCalled();
    expect(screen.getByText("Notat med linjeskift").textContent).toBe(
      "Notat\n  med linjeskift",
    );
    expect(screen.getByText("Rapporttype")).toBeVisible();
    expect((await axe(container)).violations).toEqual([]);
  });

  it("filters archived reports across pages by team and URL", () => {
    const many = Array.from({ length: 60 }, (_, index) => ({
      ...reports[0],
      id: `archived${index}`,
      title: `Arkiv ${index}`,
      url: `https://example.no/${index}`,
      teamId: index === 58 ? "t2" : "t1",
      teamName: index === 58 ? "Team Beta" : "Team Alfa",
    }));
    render(<ArchivedReportList reports={many} isAdmin={false} />);
    fireEvent.click(
      within(
        screen.getByRole("navigation", {
          name: "Sider med arkiverte rapporter",
        }),
      ).getByRole("button", { name: "3" }),
    );
    fireEvent.change(screen.getByRole("combobox", { name: "Team" }), {
      target: { value: "t2" },
    });
    expect(screen.getByRole("link", { name: "Arkiv 58" })).toBeVisible();
    fireEvent.change(screen.getByLabelText("Finn rapport"), {
      target: { value: "example.no/58" },
    });
    expect(screen.getByRole("link", { name: "Arkiv 58" })).toBeVisible();
    fireEvent.change(screen.getByRole("combobox", { name: "Team" }), {
      target: { value: "t1" },
    });
    expect(screen.getByText("Ingen rapporter passer med søket")).toBeVisible();
  });
});
