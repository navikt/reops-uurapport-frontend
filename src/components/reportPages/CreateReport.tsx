"use client";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Criterion from "./criterion/Criterion";
import type { AggregatedReport, CriterionType, Report } from "@src/types";
import {
  updateAggregatedReport,
  updateReport,
} from "@src/services/reportServices";
import {
  Tabs,
  TextField,
  Textarea,
  Chips,
  Heading,
  Link,
  Button,
  Checkbox,
  LocalAlert,
  HStack,
  Box,
} from "@navikt/ds-react";
import _ from "lodash";
import styles from "./CreateReport.module.css";
import { formatDate } from "@src/utils/client/date";
import { ArrowRightIcon } from "@navikt/aksel-icons";
import DeleteReportModal from "@components/Modal/deleteReportModal/DeleteReportModal";
import ArchiveReportModal from "@components/Modal/archiveReportModal/ArchiveReportModal";
import RestoreReportButton from "@components/Modal/restoreReport/RestoreReportButton";
import { ValidationWarnings } from "@components/ValidationWarnings/ValidationWarnings";
import SaveStatus, { type SaveState } from "./SaveStatus";
import { useQueryParam, useQueryParamList } from "@src/hooks/useQueryParam";

interface CreateReportProps {
  report: Report | AggregatedReport;
  reportType: "SINGLE" | "AGGREGATED";
  isAdmin: boolean;
}

const VALID_FILTERS = new Set([
  "COMPLIANT",
  "NON_COMPLIANT",
  "NOT_TESTED",
  "NOT_APPLICABLE",
]);

const CreateReportInner = ({
  report,
  reportType,
  isAdmin,
}: CreateReportProps) => {
  const [criteriaData, setCriteriaData] = useState<CriterionType[]>(
    report.successCriteria,
  );
  const [activeTab, setActiveTab] = useQueryParam("tab", "criteria", {
    history: "push",
  });
  const [rawFilters, setSelectedFilters] = useQueryParamList("filter");
  const selectedFilters = rawFilters.filter((filter) =>
    VALID_FILTERS.has(filter),
  );
  const [isPartOfNavNo, setIsPartOfNavNo] = useState<boolean>(
    report.isPartOfNavNo,
  );
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const router = useRouter();
  const archive = report.archive ?? null;
  const isArchived = archive !== null;
  const canEdit = report.hasWriteAccess && !isArchived;
  const canArchive = canEdit;
  const reportName = report.descriptiveName?.trim() || report.url;
  const bannerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const previousArchived = useRef(isArchived);

  // The archive/restore buttons disappear after the action, so focus would be
  // lost. Move it to whatever now describes the new state.
  useEffect(() => {
    if (previousArchived.current === isArchived) return;
    previousArchived.current = isArchived;
    (isArchived ? bannerRef.current : headingRef.current)?.focus();
  }, [isArchived]);

  const filterOptions: Record<string, string> = {
    COMPLIANT: "Tilfredsstilt",
    NON_COMPLIANT: "Ikke tilfredsstilt",
    NOT_TESTED: "Ikke testet",
    NOT_APPLICABLE: "Ikke aktuelt",
  };

  const updateReportData = async (
    updates: Partial<Report> | Partial<AggregatedReport>,
  ) => {
    setSaveState("saving");
    try {
      if (reportType === "SINGLE") {
        await updateReport(report.reportId, updates);
      } else {
        await updateAggregatedReport(report.reportId, updates);
      }
      setSaveState("saved");
    } catch (error) {
      console.error(error);
      setSaveState("error");
    }
  };

  const handleCriterionChange = useMemo(
    () =>
      _.debounce(
        (WCAGId: string, fieldToUpdate: string, updatedData: string) => {
          setCriteriaData((prev) => {
            const index = prev.findIndex(
              (criterion) => criterion.number === WCAGId,
            );
            if (index !== -1) {
              const newCriteriaData = [...prev];
              newCriteriaData[index] = {
                ...newCriteriaData[index],
                [fieldToUpdate]: updatedData,
              };
              updateReportData({
                successCriteria: [
                  {
                    ...newCriteriaData[index],
                    [fieldToUpdate]: updatedData,
                  },
                ],
              });
              return newCriteriaData;
            }
            return prev;
          });
        },
        500,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [report.reportId, reportType],
  );

  const handleMetadataChange = useMemo(
    () =>
      _.debounce((fieldToUpdate: string, updatedData: string) => {
        updateReportData({ [fieldToUpdate]: updatedData });
      }, 500),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [report.reportId, reportType],
  );

  useEffect(() => {
    return () => {
      handleCriterionChange.cancel();
      handleMetadataChange.cancel();
    };
  }, [handleCriterionChange, handleMetadataChange]);

  const handleCheckboxChange = () => {
    setIsPartOfNavNo((prev) => {
      const newValue = !prev;
      updateReportData({ isPartOfNavNo: newValue });
      return newValue;
    });
  };

  return (
    <div className={styles.reportContent}>
      {archive && (
        <div
          ref={bannerRef}
          tabIndex={-1}
          role="status"
          className={styles.archivedBanner}
        >
          <LocalAlert status="announcement">
            <LocalAlert.Header>
              <LocalAlert.Title as="h2">
                Denne rapporten er arkivert
              </LocalAlert.Title>
            </LocalAlert.Header>
            <LocalAlert.Content>
              <p>
                {`Arkivert ${formatDate(archive.archivedAt)} av ${archive.archivedBy}. `}
                {archive.reason
                  ? `Årsak: ${archive.reason}. `
                  : "Ingen årsak oppgitt. "}
                Rapporten vises ikke i rapportlistene og kan ikke redigeres før
                den er gjenopprettet.
              </p>
              {report.hasWriteAccess && (
                <RestoreReportButton
                  reportId={report.reportId}
                  reportName={reportName}
                  onRestored={() => router.refresh()}
                  onError={() => router.refresh()}
                />
              )}
            </LocalAlert.Content>
          </LocalAlert>
        </div>
      )}
      {report?.validationWarnings && report.validationWarnings.length > 0 && (
        <ValidationWarnings warnings={report.validationWarnings} />
      )}
      <Heading level="1" size="xlarge" ref={headingRef} tabIndex={-1}>
        {report?.descriptiveName}
      </Heading>
      <SaveStatus state={saveState} />
      {(canArchive || isAdmin) && (
        <Box marginBlock="space-16">
          <HStack gap="space-8" justify="end" wrap>
            {canArchive && <ArchiveReportModal reportId={report.reportId} />}
            {isAdmin && (
              <DeleteReportModal
                reportId={report.reportId}
                reportName={reportName}
                isArchived={isArchived}
                onDeleted={() => router.push("/reports")}
              />
            )}
          </HStack>
        </Box>
      )}
      <Tabs value={activeTab} onChange={setActiveTab} className={styles.tabs}>
        <Tabs.List>
          <Tabs.Tab value="criteria" label="Retningslinjer" />
          <Tabs.Tab value="metadata" label="Metadata" />
        </Tabs.List>

        <Tabs.Panel value="criteria" className={styles.tabContent}>
          <span className={styles.filtersAndButton}>
            <Chips className={styles.reportFilters}>
              {Object.keys(filterOptions).map((option) => (
                <Chips.Toggle
                  key={option}
                  selected={selectedFilters.includes(option)}
                  onClick={() => {
                    setSelectedFilters(
                      selectedFilters.includes(option)
                        ? selectedFilters.filter((filter) => filter !== option)
                        : [...selectedFilters, option],
                    );
                  }}
                >
                  {filterOptions[option]}
                </Chips.Toggle>
              ))}
            </Chips>
            {reportType === "AGGREGATED" && (
              <Button
                as={Link}
                variant="secondary"
                href={`/admin/create-report/${report?.reportId}`}
                underline={false}
                iconPosition="right"
                icon={<ArrowRightIcon aria-hidden />}
              >
                Bruk som mal
              </Button>
            )}
          </span>
          <ul className={styles.criteriaList}>
            {selectedFilters.length === 0
              ? criteriaData.map((criterion) => (
                  <li key={criterion.number}>
                    <Criterion
                      key={criterion.number}
                      criterion={criterion}
                      handleChange={handleCriterionChange}
                      hasWriteAccess={canEdit}
                    />
                  </li>
                ))
              : criteriaData
                  .filter((criterion) =>
                    selectedFilters.includes(criterion.status),
                  )
                  .map((criterion) => (
                    <li key={criterion.number}>
                      <Criterion
                        key={criterion.number}
                        criterion={criterion}
                        handleChange={handleCriterionChange}
                        hasWriteAccess={canEdit}
                      />
                    </li>
                  ))}
          </ul>
        </Tabs.Panel>
        <Tabs.Panel value="metadata" className={styles.tabContent}>
          <section className={styles.metadata}>
            {report?.created && <p>Opprettet: {formatDate(report?.created)}</p>}
            {report?.author?.email && (
              <p>Opprettet av: {report.author.email}</p>
            )}
            {report?.team?.name && <p>Ansvarlig team: {report.team.name}</p>}
            {report?.lastChanged && (
              <p>Sist endret: {formatDate(report?.lastChanged)}</p>
            )}
            {report?.lastUpdatedBy && (
              <p>Sist endret av: {report.lastUpdatedBy}</p>
            )}
          </section>
          <TextField
            label="Rapportnavn"
            id="report-name"
            name="report-name"
            defaultValue={report?.descriptiveName}
            readOnly={!canEdit}
            onChange={(e) =>
              handleMetadataChange("descriptiveName", e.target.value)
            }
          />
          <TextField
            label="URL"
            id="report-url"
            name="report-url"
            defaultValue={report?.url}
            readOnly={!canEdit}
            onChange={(e) => handleMetadataChange("url", e.target.value)}
          />
          <Textarea
            label="Notater"
            id="notes"
            name="notes"
            defaultValue={report?.notes}
            readOnly={!canEdit}
            onChange={(e) => handleMetadataChange("notes", e.target.value)}
          />
          {reportType === "SINGLE" && (
            <Checkbox
              description="Hvis rapporten er for en applikasjon som er en del av nav.no rettet mot eksterne brukere, huk av her."
              name="isPartOfNavNo"
              defaultChecked={isPartOfNavNo}
              onChange={handleCheckboxChange}
              readOnly={!canEdit}
            >
              Tjenesten er under nav.no
            </Checkbox>
          )}
        </Tabs.Panel>
      </Tabs>
    </div>
  );
};

const CreateReport = (props: CreateReportProps) => {
  return (
    <Suspense fallback={null}>
      <CreateReportInner {...props} />
    </Suspense>
  );
};

export default CreateReport;
