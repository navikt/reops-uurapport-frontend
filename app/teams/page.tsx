import { apiUrl } from "@/utils/server/urls";
import { getOboToken } from "@/utils/server/getOboToken";
import { getAuthToken } from "@/utils/server/getAuthToken";
import TeamList from "@/components/teamList/TeamList";
import NewTeamModal from "@/components/Modal/TeamModals/NewTeamModal";
import styles from "./teams.module.css";
import type { Team, User } from "@src/types";

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
      <header className={styles.headingAndButton}>
        <h1>Alle teams</h1>
        <NewTeamModal />
      </header>
      <TeamList teams={teams} isAdmin={user.isAdmin} />
    </>
  );
}
