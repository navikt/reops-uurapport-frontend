import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import Criterion from "./Criterion";
import type { CriterionType } from "@src/types";

const baseCriterion = {
  number: "1.1.1",
  name: "Ikke-tekstlig innhold",
  description: "Gi brukeren et tekstalternativ for innhold som ikke er tekst.",
  wcagUrl: "https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html",
  helpUrl: "https://aksel.nav.no",
  status: "NOT_TESTED",
} as unknown as CriterionType;

const noop = vi.fn();

describe("Criterion a11y", () => {
  it("emits the API status NON_COMPLIANT when Nei is selected", () => {
    const handleChange = vi.fn();
    render(
      <Criterion
        criterion={baseCriterion}
        handleChange={handleChange}
        hasWriteAccess
      />,
    );
    fireEvent.click(screen.getByRole("radio", { name: "Nei" }));
    expect(handleChange).toHaveBeenCalledWith(
      "1.1.1",
      "status",
      "NON_COMPLIANT",
    );
  });

  it("shows saved NON_COMPLIANT answers as Nei", () => {
    render(
      <Criterion
        criterion={{ ...baseCriterion, status: "NON_COMPLIANT" }}
        handleChange={noop}
        hasWriteAccess
      />,
    );
    expect(screen.getByRole("radio", { name: "Nei" })).toBeChecked();
  });

  it("has no axe violations (default state)", async () => {
    const { container } = render(
      <Criterion
        criterion={baseCriterion}
        handleChange={noop}
        hasWriteAccess={true}
      />,
    );
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });

  it("has no axe violations (NON_COMPLIANT expands textareas)", async () => {
    const { container } = render(
      <Criterion
        criterion={{ ...baseCriterion, status: "NON_COMPLIANT" }}
        handleChange={noop}
        hasWriteAccess={true}
      />,
    );
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });

  it("has no axe violations (read-only)", async () => {
    const { container } = render(
      <Criterion
        criterion={baseCriterion}
        handleChange={noop}
        hasWriteAccess={false}
      />,
    );
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
