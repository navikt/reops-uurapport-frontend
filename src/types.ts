export type CriterionType = {
  name: string;
  description: string;
  guideline: string;
  tools: string;
  number: string;
  breakingTheLaw: string;
  lawDoesNotApply: string;
  tooHardToComply: string;
  contentGroup: string;
  status: string;
  wcagUrl: string;
  helpUrl: string;
  wcagVersion: string;
  wcagLevel: string;
};

// export type CriteriaProps = CriterionType[]; // ikke i bruk?

export type Team = {
  id: string;
  name: string;
  email: string;
  members: string[];
};

export type NewTeam = {
  name: string;
  email: string;
  members?: string[];
};

// export type UserProps = { // ikke i bruk?
//   name: String;
//   email: String;
//   reports: Report[];
//   teams: Team[];
// };

export type Author = {
  email: string;
};

export type ValidationWarning = {
  field: string;
  message: string;
  severity: "warning" | "error";
};

export type Report = {
  reportId: string;
  url: string;
  descriptiveName: string;
  team?: Team | null;
  version: string; // Ask Rannveig what this is?
  testData: string; // Ask Rannveig what this is???
  author?: Author | null;
  filters: string[];
  created: string; // Ask Rannveig why string?
  successCriteria: CriterionType[];
  lastChanged: string; // Ask Rannveig why string?
  contributers: string[]; // Ask Rannveig what this is?
  lastUpdatedBy: string;
  reportType: string;
  hasWriteAccess: boolean;
  notes: string;
  isPartOfNavNo: boolean;
  validationWarnings?: ValidationWarning[];
};

export type ReportSummary = {
  title: string;
  id: string;
  teamId: string;
  teamName: string;
  date: string;
  isPartOfNavNo: boolean;
  reportType?: "SINGLE" | "AGGREGATED";
};

export type InitialReport = {
  name: string; // Changed to descriptiveName
  urlTilSiden: string; // Changed to url
  teamId: string; // Changed to just Id
  isPartOfNavNo: boolean;
};

export type InitializeAggregatedReport = {
  descriptiveName: string;
  url: string;
  notes: string;
  reports: string[];
  teamId: string;
};

export type AggregatedReport = {
  reportId: string;
  url: string;
  descriptiveName: string;
  team?: Team | null;
  version: string; // Ask Rannveig what this is?
  testData: string; // Ask Rannveig what this is???
  author?: Author | null;
  filters: string[];
  created: string; // Ask Rannveig why string?
  successCriteria: CriterionType[];
  lastChanged: string; // Ask Rannveig why string?
  contributers: string[]; // Ask Rannveig what this is?
  lastUpdatedBy: string;
  reportType: string;
  hasWriteAccess: boolean;
  fromTeams: { id: string; name: string }[];
  fromReports: {
    reportId: string;
    descriptiveName: string;
    url: string;
    team: Team;
    reportType: string;
    lastChanged: string;
  }[];
  notes: string;
  isPartOfNavNo: boolean;
  validationWarnings?: ValidationWarning[];
};

export type User = {
  email: string;
  name: string;
  teams: Team[];
  reports: ReportSummary[];
  isAdmin: boolean;
};

export type DiagnosticReportInfo = {
  reportId: string;
  url: string;
  descriptiveName: string;
  reportType: "SINGLE" | "AGGREGATED";
};

export type ReportDiagnostics = {
  totalReports: number;
  reportsWithNullOrganizationUnit: number;
  nullOrgReportIds: DiagnosticReportInfo[];
};
