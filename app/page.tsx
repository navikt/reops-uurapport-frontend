import { apiUrl } from "@/utils/server/urls";
import { getOboToken } from "@/utils/server/getOboToken";
import { getAuthToken } from "@/utils/server/getAuthToken";
import MyTeam from "@/components/teamDashboard/MyTeam";
import { Button, Heading, Link } from "@navikt/ds-react";
import styles from "./page.module.css";
import { ComponentIcon, FigureIcon } from "@navikt/aksel-icons";
import type { User } from "@src/types";

async function getUser(): Promise<User> {
  const token = await getAuthToken();
  const oboToken = await getOboToken(token);

  const userResponse = await fetch(`${apiUrl}/api/user`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${oboToken}`,
    },
    // @ts-expect-error - This is a valid option for duplex streaming
    duplex: "half",
  });

  if (!userResponse.ok) {
    const errorText = await userResponse.text();
    console.error("Failed to fetch user:", {
      status: userResponse.status,
      statusText: userResponse.statusText,
      body: errorText,
    });
    throw new Error(
      `Failed to fetch user: ${userResponse.status} ${userResponse.statusText}`,
    );
  }

  return userResponse.json();
}

export default async function Home() {
  const user = await getUser();

  if (user.teams.length !== 0) {
    return <MyTeam user={user} />;
  }

  return (
    <div>
      <section className={styles.section1}>
        <section className={styles.innerSection1}>
          <Heading level="1" size="xlarge">
            Velkommen til uurapport!
          </Heading>
          <p className={styles.text}>
            Denne applikasjonen er NAVs interne rapporteringsverktøy for
            tilgjengelighetserklæringer
          </p>
          <Button as={Link} href="/teams" underline={false} variant="secondary">
            Finn eller lag ditt team
          </Button>
        </section>
      </section>
      <section className={styles.section2}>
        <article className={styles.article}>
          <ComponentIcon title="code icon" fontSize="3rem" />
          <Heading level="3" size="medium">
            Les mer på{" "}
            <Link href="https://aksel.nav.no/god-praksis/universell-utforming">
              Aksel.no
            </Link>
          </Heading>
        </article>

        <article className={styles.article}>
          <FigureIcon title="accessibility figure icon" fontSize="3rem" />
          <Heading level="3" size="medium">
            Les mer på{" "}
            <Link href="https://www.uutilsynet.no/veiledning/tilgjengelighetserklaering/1127">
              uutilsynet.no
            </Link>
          </Heading>
        </article>
      </section>
    </div>
  );
}
