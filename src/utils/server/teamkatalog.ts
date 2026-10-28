import type { DeletionContact, DeletionContacts } from "@src/types";

const TEAMKATALOG_BASE =
  process.env.TEAMKATALOG_API_URL ?? "https://teamkatalog-api.intern.nav.no";

// Universell utforming
const UU_TEAM_ID =
  process.env.UU_TEAM_ID ?? "7aa9d822-78d9-4e48-a69a-b012a87e0f23";

type TeamkatalogMember = {
  navIdent: string;
  roles?: string[];
  resource?: { fullName?: string };
};

export type TeamkatalogTeam = {
  contactPersonIdent?: string | null;
  slackChannel?: string | null;
  members?: TeamkatalogMember[];
};

const toContact = (
  member: TeamkatalogMember,
  role: DeletionContact["role"],
): DeletionContact | null =>
  member.resource?.fullName
    ? { navIdent: member.navIdent, fullName: member.resource.fullName, role }
    : null;

/**
 * The team's kontaktperson is who users should ask. If the team has none
 * (or it is not among the members), fall back to the members with the LEAD
 * (Teamleder) role.
 */
export function extractContacts(team: TeamkatalogTeam): DeletionContacts {
  const members = team.members ?? [];

  const contactPerson = members.find(
    (m) => m.navIdent === team.contactPersonIdent,
  );
  const contactPersonEntry = contactPerson
    ? toContact(contactPerson, "kontaktperson")
    : null;

  const contacts = contactPersonEntry
    ? [contactPersonEntry]
    : members
        .filter((m) => m.roles?.includes("LEAD"))
        .map((m) => toContact(m, "teamleder"))
        .filter((c): c is DeletionContact => c !== null);

  return { contacts, slackChannelId: team.slackChannel ?? null };
}

export async function getDeletionContacts(): Promise<DeletionContacts> {
  const response = await fetch(`${TEAMKATALOG_BASE}/team/${UU_TEAM_ID}`, {
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) {
    throw new Error(`Teamkatalogen responded ${response.status}`);
  }
  return extractContacts((await response.json()) as TeamkatalogTeam);
}
