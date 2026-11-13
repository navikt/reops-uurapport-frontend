import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import AdminPage from "./page";

vi.mock("@src/utils/server/getAuthToken", () => ({
  getAuthToken: vi.fn().mockResolvedValue("token"),
}));
vi.mock("@src/utils/server/getOboToken", () => ({
  getOboToken: vi.fn().mockResolvedValue("token"),
}));
vi.mock("@src/components/deadline/DeadlineSettings", () => ({
  default: () => <section aria-label="Fristinnstillinger" />,
}));
vi.mock("@src/components/ReportList/ReportList", () => ({
  default: () => <div>Rapportliste</div>,
}));
vi.mock("@src/components/forbidden/Forbidden", () => ({
  default: () => <div>Ingen tilgang</div>,
}));

afterEach(() => vi.unstubAllGlobals());

describe("AdminPage", () => {
  it("shows the heading before its actions and has no axe violations", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve(url.endsWith("/api/user") ? { isAdmin: true } : []),
        }),
      ),
    );
    const { container } = render(await AdminPage());
    const heading = screen.getByRole("heading", { level: 1, name: "Admin" });
    const create = screen.getByRole("button", {
      name: "Opprett en samslått rapport",
    });
    expect(
      heading.compareDocumentPosition(create) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Rapportdiagnostikk" }),
    ).toHaveAttribute("href", "/admin/diagnostics");
    expect(
      screen.getByRole("button", { name: "Legg til admin i Azure" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Fristinnstillinger")).toBeInTheDocument();
    expect((await axe(container)).violations).toEqual([]);
  });

  it("keeps the admin page unavailable to non-admins", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve(
              url.endsWith("/api/user") ? { isAdmin: false } : [],
            ),
        }),
      ),
    );
    render(await AdminPage());
    expect(screen.getByText("Ingen tilgang")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Admin" })).toBeNull();
  });
});
