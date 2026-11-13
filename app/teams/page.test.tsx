import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import TeamsPage from "./page";

vi.mock("@/utils/server/getAuthToken", () => ({
  getAuthToken: vi.fn().mockResolvedValue("token"),
}));
vi.mock("@/utils/server/getOboToken", () => ({
  getOboToken: vi.fn().mockResolvedValue("obo"),
}));
vi.mock("@/components/teamList/TeamList", () => ({
  default: () => <div>Teamliste</div>,
}));
vi.mock("@/components/Modal/TeamModals/NewTeamModal", () => ({
  default: () => <button>Legg til ditt team</button>,
}));

afterEach(() => vi.unstubAllGlobals());

describe("TeamsPage", () => {
  it("shares the heading/action layout and has no axe violations", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) =>
        Promise.resolve({
          json: () =>
            Promise.resolve(url.endsWith("/api/user") ? { isAdmin: true } : []),
        }),
      ),
    );
    const { container } = render(await TeamsPage());
    const heading = screen.getByRole("heading", {
      level: 1,
      name: "Alle team",
    });
    const action = screen.getByRole("button", { name: "Legg til ditt team" });
    expect(heading.parentElement?.parentElement).toContainElement(action);
    expect(screen.getByText("Teamliste")).toBeInTheDocument();
    expect((await axe(container)).violations).toEqual([]);
  });
});
