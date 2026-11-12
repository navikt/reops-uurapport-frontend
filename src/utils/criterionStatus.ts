export const CRITERION_STATUS = {
  COMPLIANT: "COMPLIANT",
  NON_COMPLIANT: "NON_COMPLIANT",
  NOT_TESTED: "NOT_TESTED",
  NOT_APPLICABLE: "NOT_APPLICABLE",
} as const;

export type CriterionStatus = keyof typeof CRITERION_STATUS;

export function isCriterionStatus(value: unknown): value is CriterionStatus {
  return typeof value === "string" && Object.hasOwn(CRITERION_STATUS, value);
}
