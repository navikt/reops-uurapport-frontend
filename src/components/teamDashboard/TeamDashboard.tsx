"use client";
import { useEffect, useState } from "react";
import styles from "./TeamDashboard.module.css";
import {
  BodyLong,
  Heading,
  Radio,
  RadioGroup,
  Select,
  Alert,
  Loader,
} from "@navikt/ds-react";
import { fetcher } from "@src/utils/client/api";
import ReportList from "@components/ReportList/ReportList";
import useSWR from "swr";
import EditTeamModal from "@components/Modal/TeamModals/EditTeamModal";
import CreateReportModal from "@components/Modal/createReportModal/CreateReportModal";
import { apiProxyUrl } from "@src/utils/client/urls";
import type { ReportSummary } from "@src/types";
import type { NameType } from "recharts/types/component/DefaultTooltipContent";

interface TeamDashboardProps {
  teamId: string;
  isMyTeam: boolean;
}

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function TeamDashboard(props: TeamDashboardProps) {
  const [currentReportId, setCurrentReportId] = useState<string>("");
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );

  const {
    data: reportListData,
    error: reportListError,
    isLoading: isLoadingList,
  } = useSWR({ url: `${apiProxyUrl}/teams/${props.teamId}/reports` }, fetcher);

  const {
    data: teamData,
    error: teamError,
    isLoading: isLoadingTeamData,
  } = useSWR({ url: `${apiProxyUrl}/teams/${props.teamId}` }, fetcher);

  const reportRequest = currentReportId
    ? { url: `${apiProxyUrl}/reports/${currentReportId}` }
    : null;

  const {
    data: reportData,
    error: reportError,
    isLoading: isLoadingReport,
  } = useSWR(reportRequest, fetcher);

  const isLoading =
    isLoadingList || isLoadingTeamData || (currentReportId && isLoadingReport);
  const hasError = reportListError || teamError || reportError;

  const hasReport = Array.isArray(reportListData) && reportListData.length > 0;

  const { NOT_COMPLIANT, COMPLIANT, NOT_APPLICABLE, NOT_TESTED } =
    reportData?.successCriteria?.reduce(
      (
        acc: {
          NOT_COMPLIANT: number;
          COMPLIANT: number;
          NOT_APPLICABLE: number;
          NOT_TESTED: number;
        },
        criterion: { status?: string },
      ) => {
        switch (criterion.status) {
          case "NOT_TESTED":
            acc.NOT_TESTED++;
            break;
          case "COMPLIANT":
            acc.COMPLIANT++;
            break;
          case "NOT_APPLICABLE":
            acc.NOT_APPLICABLE++;
            break;
          default:
            acc.NOT_COMPLIANT++;
            break;
        }
        return acc;
      },
      { NOT_COMPLIANT: 0, COMPLIANT: 0, NOT_APPLICABLE: 0, NOT_TESTED: 0 },
    ) ?? { NOT_COMPLIANT: 0, COMPLIANT: 0, NOT_APPLICABLE: 0, NOT_TESTED: 0 };

  useEffect(() => {
    if (hasReport && !currentReportId) {
      setCurrentReportId(reportListData[0].id);
    }
  }, [hasReport, reportListData, currentReportId]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const total = COMPLIANT + NOT_COMPLIANT + NOT_APPLICABLE + NOT_TESTED;

  const chartData = [
    { name: "Oppfylt", value: COMPLIANT, color: "#00703C" },
    { name: "Ikke oppfylt", value: NOT_COMPLIANT, color: "#C32F27" },
    { name: "Ikke aktuelle", value: NOT_APPLICABLE, color: "#595959" },
    { name: "Ikke testet", value: NOT_TESTED, color: "#FF9100" },
  ];

  return (
    <div className={styles.teamDashboard}>
      {isLoading && (
        <div className={styles.loadingContainer}>
          <Loader size="xlarge" title="Laster teamdashboard..." />
        </div>
      )}

      {hasError && !isLoading && (
        <div className={styles.errorContainer}>
          <Alert variant="error">
            Noe gikk galt ved lasting av data. Vennligst prøv igjen senere.
          </Alert>
        </div>
      )}

      {!isLoading && !hasError && (
        <>
          <div className={styles.teamHeader}>
            <Heading level="2" size="large">
              {teamData?.name ?? "Ukjent team"}
            </Heading>
            {props.isMyTeam && (
              <div className={styles.buttons}>
                <CreateReportModal />
              </div>
            )}
          </div>

          <div className={styles.chartAndInfo}>
            {hasReport && currentReportId ? (
              <section className={styles.pieChart}>
                {isMobile ? (
                  <>
                    <Select
                      label="Velg rapport"
                      value={currentReportId}
                      onChange={(e) => setCurrentReportId(e.target.value)}
                    >
                      {reportListData.map((report: ReportSummary) => (
                        <option key={report.id} value={report.id}>
                          {report.title}
                        </option>
                      ))}
                    </Select>
                    <p>Oppfylt: {COMPLIANT}</p>
                    <p>Ikke oppfylt: {NOT_COMPLIANT}</p>
                    <p>Ikke aktuelle: {NOT_APPLICABLE}</p>
                    <p>Ikke testet: {NOT_TESTED}</p>
                  </>
                ) : (
                  <>
                    <RadioGroup
                      name="report"
                      legend="Velg rapport"
                      value={currentReportId}
                      onChange={setCurrentReportId}
                    >
                      {reportListData.map((report: ReportSummary) => (
                        <Radio key={report.id} value={report.id}>
                          {report.title}
                        </Radio>
                      ))}
                    </RadioGroup>

                    <div className={styles.chartContainer}>
                      <ResponsiveContainer width="100%" height={230}>
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx={140}
                            cy={110}
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={2}
                            dataKey="value"
                            isAnimationActive={false}
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value?: number, _name?: NameType) => {
                              const safeValue =
                                typeof value === "number" ? value : 0;

                              if (!total) {
                                return [`${safeValue} (0%)`, ""];
                              }

                              const percentage = (
                                (safeValue / total) *
                                100
                              ).toFixed(1);
                              return [`${safeValue} (${percentage}%)`, ""];
                            }}
                          />
                          <Legend
                            layout="vertical"
                            verticalAlign="middle"
                            align="right"
                            content={(legendProps) => {
                              const { payload } = legendProps;
                              return (
                                <ul
                                  style={{
                                    listStyle: "none",
                                    padding: 0,
                                    margin: 0,
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "12px",
                                  }}
                                >
                                  {payload?.map((entry: any, index: number) => (
                                    <li
                                      key={`item-${index}`}
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                      }}
                                    >
                                      <div
                                        style={{
                                          width: 16,
                                          height: 16,
                                          backgroundColor: entry.color,
                                          borderRadius: "2px",
                                          flexShrink: 0,
                                        }}
                                      />
                                      <span
                                        style={{
                                          fontSize: "16px",
                                          fontFamily: "Source Sans Pro",
                                          color: "#23262a",
                                        }}
                                      >
                                        {entry.value}: {entry.payload.value}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              );
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </>
                )}
              </section>
            ) : (
              <section className={styles.pieChart}>
                <BodyLong>Ingen rapporter tilgjengelig</BodyLong>
              </section>
            )}

            <section className={styles.teamInfo}>
              <div className={styles.teamInfoHeader}>
                <Heading level="3" size="medium">
                  Team detaljer
                </Heading>
                {props.isMyTeam && <EditTeamModal teamId={props.teamId} />}
              </div>
              <span className={styles.divider} />
              <Heading level="3" size="small">
                Team ansvarlig
              </Heading>
              *<BodyLong>{teamData?.email ?? "Ikke satt"}</BodyLong>
              <span className={styles.divider} />
              <Heading level="3" size="small">
                Teammedlemmer
              </Heading>
              <ul className={styles.memberList}>
                {teamData?.members?.length ? (
                  teamData.members.map((member: string) => (
                    <li key={member}>{member}</li>
                  ))
                ) : (
                  <li>Ingen medlemmer registrert</li>
                )}
              </ul>
            </section>
          </div>

          <section className={styles.reportList}>
            <Heading level="3" size="small">
              Rapporter
            </Heading>
            <ReportList reports={reportListData ?? []} />
          </section>
        </>
      )}
    </div>
  );
}

export default TeamDashboard;
