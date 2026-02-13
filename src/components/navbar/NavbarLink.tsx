"use client";

import { usePathname } from "next/navigation";
import NextLink from "next/link";
import styles from "./NavbarLink.module.css";
import type { ReactNode } from "react";
import { HStack, Link } from "@navikt/ds-react";

interface NavbarLinkProps {
  href: string;
  children: ReactNode;
  icon?: ReactNode;
}

export function NavbarLink({ href, children, icon }: NavbarLinkProps) {
  const pathname = usePathname();
  const isCurrent = pathname === href;

  return (
    <Link
      as={NextLink}
      href={href}
      className={styles.headerLink}
      data-current={isCurrent}
    >
      <HStack align="center">
        {icon}
        {children}
      </HStack>
    </Link>
  );
}
