"use client";

import NextLink from "next/link";
import { Button, type ButtonProps } from "@navikt/ds-react";

interface LinkButtonProps extends Omit<ButtonProps, "as"> {
  href: string;
}

export function LinkButton({ href, children, ...props }: LinkButtonProps) {
  return (
    <Button as={NextLink} href={href} {...props}>
      {children}
    </Button>
  );
}
