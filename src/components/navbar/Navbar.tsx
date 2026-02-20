import { Box, HStack } from "@navikt/ds-react";
import styles from "./Navbar.module.css";
import { LeaveIcon, GavelSoundBlockIcon } from "@navikt/aksel-icons";
import { apiUrl } from "../../utils/server/urls";
import { getOboToken } from "@/utils/server/getOboToken";
import { getAuthToken } from "@/utils/server/getAuthToken";
import MobileNavbar from "./MobileNavbar";
import { ThemeButton } from "@/components/theme/ThemeButton";
import { NavbarLink } from "./NavbarLink";
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
    const errorBody = await response.text();
    console.error(
      `Failed to fetch user from ${apiUrl}/api/user. Status: ${response.status}, Body: ${errorBody}`,
    );
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
              <NavbarLink href="/">Forside</NavbarLink>
            </li>
            <li>
              <NavbarLink href="/teams">Teams</NavbarLink>
            </li>
            <li>
              <NavbarLink href="/reports">Alle rapporter</NavbarLink>
            </li>
            {userDetails?.isAdmin && (
              <li>
                <NavbarLink
                  href="/admin"
                  icon={<GavelSoundBlockIcon fontSize="30" aria-hidden />}
                >
                  Admin
                </NavbarLink>
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
              <ThemeButton />
            </li>
            <li>
              <a href="/oauth2/logout" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <LeaveIcon aria-hidden /> Logg Ut
              </a>
            </li>
          </HStack>
        </HStack>
      </Box>
    </span>
  );
}
