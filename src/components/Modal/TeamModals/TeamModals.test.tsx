import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { axe } from "vitest-axe";
import NewTeamModal from "./NewTeamModal";
import EditTeamModal from "./EditTeamModal";
import { TeamRequestError } from "@src/services/teamServices";

const refresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh, push: vi.fn() }),
}));
vi.mock("swr/immutable", () => ({
  default: () => ({ data: { email: "dev@localhost" }, mutate: vi.fn() }),
}));
vi.mock("swr", () => ({
  default: () => ({
    data: {
      id: "t1",
      name: "Team Alfa",
      email: "alfa@nav.no",
      members: ["a@nav.no", "b@nav.no"],
    },
    mutate: vi.fn(),
  }),
  mutate: vi.fn(),
}));
const createNewTeam = vi.fn();
const updateTeam = vi.fn();
vi.mock("@src/services/teamServices", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@src/services/teamServices")>()),
  createNewTeam: (...args: unknown[]) => createNewTeam(...args),
  updateTeam: (...args: unknown[]) => updateTeam(...args),
}));

const memberInputs = () =>
  screen.getAllByLabelText(
    /^E-postadresse til medlem \d/,
  ) as HTMLInputElement[];

describe("team modals (shared form)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("new team: prefills owner email, adds and removes members, has no axe violations", async () => {
    render(<NewTeamModal />);
    fireEvent.click(screen.getByRole("button", { name: /Legg til ditt team/ }));

    expect(
      (screen.getByLabelText("E-postadresse til teameier") as HTMLInputElement)
        .value,
    ).toBe("dev@localhost");

    fireEvent.click(screen.getByRole("button", { name: "Legg til medlem" }));
    fireEvent.click(screen.getByRole("button", { name: "Legg til medlem" }));
    expect(memberInputs()).toHaveLength(3);
    fireEvent.change(memberInputs()[1], { target: { value: "b@nav.no" } });
    fireEvent.click(screen.getByRole("button", { name: "Fjern medlem 1" }));
    expect(memberInputs().map((i) => i.value)).toEqual(["b@nav.no", ""]);

    expect((await axe(document.body)).violations).toEqual([]);
  });

  it("new team: submits trimmed values without blank members", async () => {
    createNewTeam.mockResolvedValue(undefined);
    render(<NewTeamModal />);
    fireEvent.click(screen.getByRole("button", { name: /Legg til ditt team/ }));
    fireEvent.change(screen.getByLabelText("Teamnavn"), {
      target: { value: " Nytt team " },
    });
    fireEvent.change(memberInputs()[0], { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "Legg til medlem" }));
    fireEvent.change(memberInputs()[1], { target: { value: " x@nav.no " } });
    fireEvent.click(screen.getByRole("button", { name: "Opprett team" }));

    await waitFor(() =>
      expect(createNewTeam).toHaveBeenCalledWith({
        name: "Nytt team",
        email: "dev@localhost",
        members: ["x@nav.no"],
      }),
    );
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("edit team: autofills current values and lets existing members be removed", async () => {
    updateTeam.mockResolvedValue(undefined);
    render(<EditTeamModal teamId="t1" />);
    fireEvent.click(screen.getByRole("button", { name: "Rediger" }));

    expect((screen.getByLabelText("Teamnavn") as HTMLInputElement).value).toBe(
      "Team Alfa",
    );
    expect(
      (screen.getByLabelText("E-postadresse til teameier") as HTMLInputElement)
        .value,
    ).toBe("alfa@nav.no");
    expect(memberInputs().map((i) => i.value)).toEqual([
      "a@nav.no",
      "b@nav.no",
    ]);

    fireEvent.click(screen.getByRole("button", { name: "Fjern medlem 1" }));
    fireEvent.click(screen.getByRole("button", { name: "Lagre" }));

    await waitFor(() =>
      expect(updateTeam).toHaveBeenCalledWith("t1", {
        id: "t1",
        name: "Team Alfa",
        email: "alfa@nav.no",
        members: ["b@nav.no"],
      }),
    );
    expect((await axe(document.body)).violations).toEqual([]);
  });

  it("edit team: reopening shows saved values, not discarded edits", () => {
    render(<EditTeamModal teamId="t1" />);
    fireEvent.click(screen.getByRole("button", { name: "Rediger" }));
    fireEvent.change(screen.getByLabelText("Teamnavn"), {
      target: { value: "Endret" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Avbryt" }));
    fireEvent.click(screen.getByRole("button", { name: "Rediger" }));
    expect((screen.getByLabelText("Teamnavn") as HTMLInputElement).value).toBe(
      "Team Alfa",
    );
  });

  it("shows the server status when saving fails", async () => {
    updateTeam.mockRejectedValue(new TeamRequestError("x", 403));
    render(<EditTeamModal teamId="t1" />);
    fireEvent.click(screen.getByRole("button", { name: "Rediger" }));
    fireEvent.click(screen.getByRole("button", { name: "Lagre" }));
    expect((await screen.findByRole("alert")).textContent).toContain(
      "feilkode 403",
    );
  });
});
