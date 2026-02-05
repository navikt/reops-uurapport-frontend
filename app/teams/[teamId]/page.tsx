import { apiUrl } from "@/utils/server/urls";
import { getOboToken } from "@/utils/server/getOboToken";
import { getAuthToken } from "@/utils/server/getAuthToken";
import TeamDashboard from "@/components/teamDashboard/TeamDashboard";
import type { User } from "@src/types";

async function getUser() {
  const token = await getAuthToken();
  const oboToken = await getOboToken(token);

  const userResponse = await fetch(`${apiUrl}/api/user`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${oboToken}`,
    },
  });

  return userResponse.json();
}

export default async function TeamPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const user: User = await getUser();

  const isMyTeam =
    user.teams.some((team) => team.id === teamId) || user.isAdmin;

  return <TeamDashboard teamId={teamId} isMyTeam={isMyTeam} />;
}
