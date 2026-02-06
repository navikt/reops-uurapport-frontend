"use client";

import NextLink from "next/link";
import {
  Link as AkselLink,
  LinkProps as AkselLinkProps,
} from "@navikt/ds-react";
import { ComponentPropsWithoutRef, forwardRef } from "react";

// Combine props from both Next.js Link and Aksel Link
type LinkProps = Omit<AkselLinkProps, "as"> & {
  href: string;
  // Additional Next.js Link props that might be useful
  replace?: boolean;
  scroll?: boolean;
  prefetch?: boolean;
};

/**
 * Reusable Link component that combines Next.js routing with Aksel design.
 * Use this instead of plain <a> tags for consistent styling across the app.
 *
 * @example
 * ```tsx
 * <Link href="/reports">View Reports</Link>
 * <Link href="/team/123" variant="action">Team Details</Link>
 * ```
 */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ href, replace, scroll, prefetch, ...akselProps }, ref) => {
    return (
      <AkselLink
        as={NextLink}
        href={href}
        replace={replace}
        scroll={scroll}
        prefetch={prefetch}
        ref={ref}
        {...akselProps}
      />
    );
  },
);

Link.displayName = "Link";
