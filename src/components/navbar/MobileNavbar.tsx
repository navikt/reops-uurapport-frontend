"use client";

import NextLink from "next/link";
import {
  MenuHamburgerIcon,
  LeaveIcon,
  GavelSoundBlockIcon,
} from "@navikt/aksel-icons";
import { Button, Dropdown } from "@navikt/ds-react";
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
            <Dropdown.Menu.List.Item as={NextLink} href="/">
              Forside
            </Dropdown.Menu.List.Item>
            <Dropdown.Menu.List.Item as={NextLink} href="/teams">
              Alle team
            </Dropdown.Menu.List.Item>
            <Dropdown.Menu.List.Item as={NextLink} href="/reports">
              Alle rapporter
            </Dropdown.Menu.List.Item>
            {user.isAdmin && (
              <Dropdown.Menu.List.Item as={NextLink} href="/admin">
                <GavelSoundBlockIcon />
                Admin
              </Dropdown.Menu.List.Item>
            )}
            <Dropdown.Menu.Divider />
            <Dropdown.Menu.List.Item
              as="a"
              href="/oauth2/logout"
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
