import { apiUrl } from "@/utils/server/urls";
import { getOboToken } from "@/utils/server/getOboToken";
import { getAuthToken } from "@/utils/server/getAuthToken";
import TeamList from "@/components/teamList/TeamList";
import NewTeamModal from "@/components/Modal/TeamModals/NewTeamModal";
import type { Team, User } from "@src/types";
import { Heading } from "@navikt/ds-react";
import { Suspense } from "react";
import { PageHeader } from "@components/layout/PageHeader";

async function getData() {
  const token = await getAuthToken();
  const oboToken = await getOboToken(token);

  const [userResponse, teamsResponse] = await Promise.all([
    fetch(`${apiUrl}/api/user`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${oboToken}`,
      },
    }),
    fetch(`${apiUrl}/api/teams`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${oboToken}`,
      },
    }),
  ]);

  const user: User = await userResponse.json();
  const teams: Team[] = await teamsResponse.json();

  return { user, teams };
}

export default async function TeamsPage() {
  const { user, teams } = await getData();

  return (
    <>
      <PageHeader actions={<NewTeamModal />}>
        <Heading level="1" size="xlarge">
          Alle team
        </Heading>
      </PageHeader>
      <Suspense fallback={null}>
        <TeamList teams={teams} isAdmin={user.isAdmin} />
      </Suspense>
    </>
  );
}
