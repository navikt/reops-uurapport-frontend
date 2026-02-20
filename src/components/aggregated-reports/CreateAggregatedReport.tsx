"use client";
import { useState } from "react";
import {
  Button,
  Checkbox,
  CheckboxGroup,
  Select,
  Textarea,
  TextField,
  DatePicker,
  useDatepicker,
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
  const [useDataFilter, setUseDataFilter] = useState<boolean>(false);
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
        startDate: undefined,
        endDate: undefined,
      };
    },
  );

  const { datepickerProps: startDatepickerProps, inputProps: startInputProps } =
    useDatepicker({
      onDateChange: (date) => {
        const dateString = date ? date.toISOString().split("T")[0] : undefined;
        setInitialData((prev) => ({ ...prev, startDate: dateString }));
        if (useDataFilter && dateString && initialData.endDate) {
          filterReportsByDate(dateString, initialData.endDate);
        }
      },
    });

  const { datepickerProps: endDatepickerProps, inputProps: endInputProps } =
    useDatepicker({
      onDateChange: (date) => {
        const dateString = date ? date.toISOString().split("T")[0] : undefined;
        setInitialData((prev) => ({ ...prev, endDate: dateString }));
        if (useDataFilter && initialData.startDate && dateString) {
          filterReportsByDate(initialData.startDate, dateString);
        }
      },
    });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setInitialData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const filterReportsByDate = (startDate: string, endDate: string) => {
    const filteredReports = reports
      .filter((report) => {
        if (!report.date) return false;
        const reportDate = new Date(report.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return reportDate >= start && reportDate <= end;
      })
      .map((report) => report.id);

    setInitialData((prev) => ({ ...prev, reports: filteredReports }));
  };

  const handleDateFilterToggle = (checked: boolean) => {
    setUseDataFilter(checked);
    if (!checked) {
      // Reset to original reports when date filter is disabled
      setSelectNavNo(false);
      const originalReports = aggregatedReport
        ? reports
            .filter((report) =>
              aggregatedReport.fromReports
                .map((r) => r.reportId)
                .includes(report.id),
            )
            .map((report) => report.id)
        : [];
      setInitialData((prev) => ({
        ...prev,
        reports: originalReports,
        startDate: undefined,
        endDate: undefined,
      }));
    } else if (initialData.startDate && initialData.endDate) {
      filterReportsByDate(initialData.startDate, initialData.endDate);
    }
  };

  const handleSelectNavNo = (checked: boolean) => {
    setSelectNavNo(checked);
    setUseDataFilter(false);
    if (checked) {
      const navNoReports = reports
        .filter((report) => report.isPartOfNavNo)
        .map((report) => report.id);
      setInitialData((prev) => ({
        ...prev,
        reports: navNoReports,
        startDate: undefined,
        endDate: undefined,
      }));
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
      setInitialData((prev) => ({
        ...prev,
        reports: originalReports,
        startDate: undefined,
        endDate: undefined,
      }));
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
        checked={useDataFilter}
        onChange={(e) => handleDateFilterToggle(e.target.checked)}
      >
        Filtrer rapporter basert på dato
      </Checkbox>
      {useDataFilter && (
        <div className={styles.dateFilterContainer}>
          <DatePicker {...startDatepickerProps}>
            <DatePicker.Input
              {...startInputProps}
              label="Startdato"
              description="Velg startdato for rapporter som skal inkluderes"
            />
          </DatePicker>
          <DatePicker {...endDatepickerProps}>
            <DatePicker.Input
              {...endInputProps}
              label="Sluttdato"
              description="Velg sluttdato for rapporter som skal inkluderes"
            />
          </DatePicker>
        </div>
      )}
      <Checkbox
        checked={selectNavNo}
        onChange={(e) => handleSelectNavNo(e.target.checked)}
        disabled={useDataFilter}
      >
        Huk av alle &ldquo;nav.no&rdquo;-rapporter
      </Checkbox>
      <CheckboxGroup
        legend="Velg rapporter du ønsker å slå sammen"
        size="small"
        value={initialData.reports}
        onChange={(e) => {
          setSelectNavNo(false);
          setUseDataFilter(false);
          setInitialData((prev) => ({
            ...prev,
            reports: e,
            startDate: undefined,
            endDate: undefined,
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
