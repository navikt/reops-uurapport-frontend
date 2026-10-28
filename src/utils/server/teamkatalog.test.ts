import { describe, it, expect } from "vitest";
import { extractContacts } from "./teamkatalog";

const member = (navIdent: string, fullName: string, roles: string[] = []) => ({
  navIdent,
  roles,
  resource: { fullName },
});

describe("extractContacts", () => {
  it("returns the kontaktperson when set", () => {
    const result = extractContacts({
      contactPersonIdent: "B2",
      members: [
        member("A1", "Lena Leder", ["LEAD"]),
        member("B2", "Kari Kontakt"),
      ],
    });
    expect(result.contacts).toEqual([
      { navIdent: "B2", fullName: "Kari Kontakt", role: "kontaktperson" },
    ]);
  });

  it("falls back to team leads when there is no kontaktperson", () => {
    const result = extractContacts({
      contactPersonIdent: null,
      members: [
        member("A1", "Lena Leder", ["LEAD", "DEVELOPER"]),
        member("B2", "Dev Dev", ["DEVELOPER"]),
      ],
    });
    expect(result.contacts).toEqual([
      { navIdent: "A1", fullName: "Lena Leder", role: "teamleder" },
    ]);
  });

  it("falls back to team leads when kontaktperson is not a member", () => {
    const result = extractContacts({
      contactPersonIdent: "X9",
      members: [member("A1", "Lena Leder", ["LEAD"])],
    });
    expect(result.contacts.map((c) => c.role)).toEqual(["teamleder"]);
  });

  it("returns no contacts when nothing matches", () => {
    expect(extractContacts({ members: [] }).contacts).toEqual([]);
    expect(extractContacts({}).contacts).toEqual([]);
  });

  it("passes the slack channel id along", () => {
    expect(extractContacts({ slackChannel: "C123ABC456" }).slackChannelId).toBe(
      "C123ABC456",
    );
  });
});
