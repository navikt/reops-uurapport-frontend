"use client";

import NextLink from "next/link";
import { MenuHamburgerIcon, LeaveIcon } from "@navikt/aksel-icons";
import { Link, Button, Dropdown } from "@navikt/ds-react";
import type { User } from "@src/types";

interface MobileNavbarProps {
  user: User;
}

const MobileNavbar = ({ user }: MobileNavbarProps) => {
  return (
    <div className="min-h-32">
      <Dropdown>
        <Button
          variant="tertiary"
          as={Dropdown.Toggle}
          icon={<MenuHamburgerIcon fontSize="1.5rem" title="Meny" />}
        />
        <Dropdown.Menu>
          <Dropdown.Menu.List>
            <NextLink href="/" passHref legacyBehavior>
              <Dropdown.Menu.List.Item as="a">Forside</Dropdown.Menu.List.Item>
            </NextLink>
            <NextLink href="/teams" passHref legacyBehavior>
              <Dropdown.Menu.List.Item as="a">
                Alle team
              </Dropdown.Menu.List.Item>
            </NextLink>
            <NextLink href="/reports" passHref legacyBehavior>
              <Dropdown.Menu.List.Item as="a">
                Alle rapporter
              </Dropdown.Menu.List.Item>
            </NextLink>
            {user.isAdmin && (
              <NextLink href="/admin" passHref legacyBehavior>
                <Dropdown.Menu.List.Item as="a">Admin</Dropdown.Menu.List.Item>
              </NextLink>
            )}
            <Dropdown.Menu.Divider />
            <Dropdown.Menu.List.Item
              as={Link}
              href="/oauth2/logout"
              target="_blank"
            >
              <LeaveIcon />
              Logg ut
            </Dropdown.Menu.List.Item>
          </Dropdown.Menu.List>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

export default MobileNavbar;
