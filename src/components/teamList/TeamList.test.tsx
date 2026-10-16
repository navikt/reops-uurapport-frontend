import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { axe } from "vitest-axe";
import TeamList from "./TeamList";
import type { Team } from "@src/types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  usePathname: () => "/teams",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@components/Modal/TeamModals/EditTeamModal", () => ({
  default: () => null,
}));
vi.mock("@components/Modal/deleteTeam/DeleteTeamModal", () => ({
  default: () => null,
}));

const teams: Team[] = [
  { id: "1", name: "Team Alpha", members: [] },
  { id: "2", name: "Team Beta", members: [] },
] as unknown as Team[];

describe("TeamList a11y", () => {
  it("has no axe violations (admin view)", async () => {
    const { container } = render(<TeamList teams={teams} isAdmin={true} />);
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });

  it("has no axe violations (member view)", async () => {
    const { container } = render(<TeamList teams={teams} isAdmin={false} />);
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
