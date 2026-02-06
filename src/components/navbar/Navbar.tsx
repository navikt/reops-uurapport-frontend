import { Link } from "@/components/Link";
import { Box, HStack } from "@navikt/ds-react";
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
      <Box
        as="header"
        background="default"
        borderWidth="0 0 1"
        borderColor="neutral-subtle"
        paddingBlock="space-16"
        paddingInline="space-16"
        className={styles.desktopNavbar}
      >
        <HStack
          justify="space-between"
          align="center"
          gap="space-16"
          style={{ maxWidth: "1280px", margin: "0 auto" }}
        >
          <HStack
            as="ul"
            gap="space-16"
            align="center"
            style={{ listStyle: "none" }}
          >
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
          </HStack>
          <HStack
            as="ul"
            gap="space-16"
            align="center"
            style={{ listStyle: "none" }}
          >
            <li>
              <p>
                Innlogget som: <strong>{userDetails.email}</strong>
              </p>
            </li>
            <li>
              <ThemeToggle />
            </li>
            <li>
              <Link underline={false} href="/oauth2/logout">
                <LeaveIcon aria-hidden /> Logg Ut
              </Link>
            </li>
          </HStack>
        </HStack>
      </Box>
    </span>
  );
}
