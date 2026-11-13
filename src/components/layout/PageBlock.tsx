"use client";
import {
  Page,
  type OverridableComponent,
  type PageBlockProps,
} from "@navikt/ds-react";
import { forwardRef, type ElementType } from "react";
import styles from "./PageBlock.module.css";

/**
 * Aksel's `Page.Block`, usable from Server Components (the `Page.Block`
 * property is not available on the client reference a Server Component sees).
 * Header, main and footer all use it so they share the same width and gutters.
 */
export const PageBlock: OverridableComponent<PageBlockProps, HTMLDivElement> =
  forwardRef<HTMLDivElement, PageBlockProps & { as?: ElementType }>(
    function PageBlock({ width, className, ...props }, ref) {
      return (
        <Page.Block
          {...props}
          ref={ref}
          width={width === "xl" ? undefined : width}
          className={[width === "xl" && styles.responsiveWidth, className]
            .filter(Boolean)
            .join(" ")}
        />
      );
    },
  );
