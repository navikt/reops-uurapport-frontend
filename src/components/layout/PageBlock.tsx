"use client";
import { Page } from "@navikt/ds-react";

/**
 * Aksel's `Page.Block`, usable from Server Components (the `Page.Block`
 * property is not available on the client reference a Server Component sees).
 * Header, main and footer all use it so they share the same width and gutters.
 */
export const PageBlock = Page.Block;
