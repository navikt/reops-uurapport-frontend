import { Link } from "@/components/Link";
import styles from "./Navbar.module.css";
import { LeaveIcon } from "@navikt/aksel-icons";
import { apiUrl } from "../../utils/server/urls";
import { getOboToken } from "@/utils/server/getOboToken";
import { getAuthToken } from "@/utils/server/getAuthToken";
import MobileNavbar from "./MobileNavbar";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import type { User } from "@src/types";

async function getUserDetails(): Promise<User> {
  const token = await getAuthToken();
  const oboToken = await getOboToken(token);

  const response = await fetch(`${apiUrl}/api/user`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${oboToken}`,
    },
    // @ts-expect-error - This is a valid option for duplex streaming
    duplex: "half",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.status}`);
  }

  return response.json();
}

export default async function Navbar() {
  const userDetails = await getUserDetails();

  return (
    <span>
      <header className={styles.mobileNavbar}>
        <MobileNavbar user={userDetails} />
      </header>
      <header className={styles.navBarContainer}>
        <span className={styles.contentWrapper}>
          <ul className={styles.links}>
            <li>
              <Link underline={false} data-color="neutral" href="/">
                Forside
              </Link>
            </li>
            <li>
              <Link underline={false} data-color="neutral" href="/teams">
                Teams
              </Link>
            </li>
            <li>
              <Link underline={false} data-color="neutral" href="/reports">
                Alle rapporter
              </Link>
            </li>
            {userDetails?.isAdmin && (
              <li>
                <Link underline={false} href="/admin">
                  Admin
                </Link>
              </li>
            )}
          </ul>
          <ul className={styles.links}>
            <li>
              <p>
                Innlogget som: <strong>{userDetails.email}</strong>
              </p>
            </li>
            <li>
              <ThemeToggle />
            </li>
            <li className={styles.utlogging}>
              <Link underline={false} href="/oauth2/logout">
                <LeaveIcon /> Logg Ut
              </Link>
            </li>
          </ul>
        </span>
      </header>
    </span>
  );
}
