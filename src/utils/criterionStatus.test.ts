import { describe, expect, it } from "vitest";
import report from "../../mock/report.json";
import report2 from "../../mock/report2.json";
import { CRITERION_STATUS, isCriterionStatus } from "./criterionStatus";

describe("criterion status contract", () => {
  it.each(Object.values(CRITERION_STATUS))(
    "accepts API status %s",
    (status) => {
      expect(isCriterionStatus(status)).toBe(true);
    },
  );

  it.each([
    undefined,
    null,
    "NOT_COMPLIANT",
    "non-compliant",
    "UNKNOWN",
    "toString",
  ])("rejects invalid raw status %s", (status) => {
    expect(isCriterionStatus(status)).toBe(false);
  });

  it.each([
    ["report.json", report],
    ["report2.json", report2],
  ] as const)(
    "keeps every criterion in %s aligned with the API enum",
    (_name, fixture) => {
      expect(fixture.successCriteria.length).toBeGreaterThan(0);
      for (const criterion of fixture.successCriteria) {
        expect(
          isCriterionStatus(criterion.status),
          `${criterion.number}: ${criterion.status}`,
        ).toBe(true);
      }
      expect(
        fixture.successCriteria.some(
          (criterion) => criterion.status === CRITERION_STATUS.NON_COMPLIANT,
        ),
      ).toBe(true);
    },
  );
});
