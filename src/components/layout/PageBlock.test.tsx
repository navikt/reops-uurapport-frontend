import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PageBlock } from "./PageBlock";

describe("PageBlock", () => {
  it("uses the responsive app width while preserving gutters, classes and refs", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <PageBlock width="xl" gutters className="custom" ref={ref}>
        Content
      </PageBlock>,
    );
    const block = screen.getByText("Content");
    expect(block).toHaveClass("custom", "aksel-pageblock--gutters");
    expect(block).not.toHaveClass("aksel-pageblock--xl");
    expect(ref.current).toBe(block);
  });

  it("preserves other Aksel width presets", () => {
    render(
      <PageBlock as="section" width="text">
        Content
      </PageBlock>,
    );
    const block = screen.getByText("Content");
    expect(block).toHaveClass("aksel-pageblock--text");
    expect(block.tagName).toBe("SECTION");
  });
});
