"use client";
import { useState } from "react";
import {
  Button,
  Checkbox,
  CheckboxGroup,
  Select,
  Textarea,
  TextField,
} from "@navikt/ds-react";
import type {
  AggregatedReport,
  InitializeAggregatedReport,
  ReportSummary,
  Team,
} from "@src/types";
import { createAggregatedReport } from "@src/services/reportServices";
import styles from "./CreateAggregatedReport.module.css";

interface ReportListProps {
  reports: ReportSummary[];
  aggregatedReport?: AggregatedReport;
  userTeams?: Team[];
}

const Reports = ({ reports, aggregatedReport, userTeams }: ReportListProps) => {
  const [selectNavNo, setSelectNavNo] = useState<boolean>(false);
  const [initialData, setInitialData] = useState<InitializeAggregatedReport>(
    () => {
      const defaultTeam = userTeams?.find(
        (team: Team) =>
          team.id === "team-universell-utforming" ||
          team.name.toLowerCase() === "team universell utforming",
      );

      const reportIds = aggregatedReport
        ? reports
            .filter((report) =>
              aggregatedReport.fromReports
                .map((r) => r.reportId)
                .includes(report.id),
            )
            .map((report) => report.id)
        : [];

      return {
        descriptiveName: aggregatedReport?.descriptiveName || "",
        url: aggregatedReport?.url || "Aggregated report URL not applicable",
        notes: aggregatedReport?.notes || "",
        reports: reportIds,
        teamId: aggregatedReport?.team?.id || defaultTeam?.id || "",
      };
    },
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setInitialData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectNavNo = (checked: boolean) => {
    setSelectNavNo(checked);
    if (checked) {
      const navNoReports = reports
        .filter((report) => report.isPartOfNavNo)
        .map((report) => report.id);
      setInitialData((prev) => ({ ...prev, reports: navNoReports }));
    } else {
      const originalReports = aggregatedReport
        ? reports
            .filter((report) =>
              aggregatedReport.fromReports
                .map((r) => r.reportId)
                .includes(report.id),
            )
            .map((report) => report.id)
        : [];
      setInitialData((prev) => ({ ...prev, reports: originalReports }));
    }
  };

  return (
    <div className={styles.createReportContainer}>
      <TextField
        label="Tittel"
        description="Tittel på den nye samlerapporten"
        onChange={handleChange}
        name="descriptiveName"
        value={initialData.descriptiveName}
      />
      <Select
        label="Team"
        description="Hvilket team er ansvarlig for samlerapporten?"
        name="teamId"
        onChange={handleChange}
        value={initialData.teamId}
      >
        <option value="">Velg team</option>
        {userTeams?.map((team: Team) => (
          <option key={team.id} value={team.id}>
            {team.name}
          </option>
        ))}
      </Select>
      <Textarea
        label="Notater"
        name="notes"
        value={initialData.notes}
        onChange={(e) => {
          setInitialData((prev) => ({ ...prev, notes: e.target.value }));
        }}
      />
      <Checkbox
        checked={selectNavNo}
        onChange={(e) => handleSelectNavNo(e.target.checked)}
      >
        Huk av alle &ldquo;nav.no&rdquo;-rapporter
      </Checkbox>
      <CheckboxGroup
        legend="Velg rapporter du ønsker å slå sammen"
        size="small"
        value={initialData.reports}
        onChange={(e) => {
          setSelectNavNo(false);
          setInitialData((prev) => ({
            ...prev,
            reports: e,
          }));
        }}
      >
        {reports.map((report: ReportSummary) => (
          <Checkbox value={report.id} key={report.id}>
            {report.title ? report.title : "(Uten navn)"}
          </Checkbox>
        ))}
      </CheckboxGroup>
      <Button
        variant="primary"
        onClick={() => createAggregatedReport(initialData)}
        className={styles.createReportButton}
        disabled={
          !initialData.descriptiveName ||
          !initialData.teamId ||
          initialData.reports.length === 0
        }
      >
        Opprett rapport
      </Button>
    </div>
  );
};

export default Reports;
