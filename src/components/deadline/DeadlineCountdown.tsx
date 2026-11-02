"use client";
import { useEffect, useState } from "react";
import { GlobalAlert, Link } from "@navikt/ds-react";
import { getTimeLeft, resolveDeadline } from "@src/utils/client/deadline";
import { useDeadlineOverride } from "./useDeadline";
import styles from "./DeadlineCountdown.module.css";

const SHOW_WITHIN_DAYS = 61;

const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);

function DeadlineCountdown() {
  const { override } = useDeadlineOverride();
  // null until mounted so server and client markup match
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const first = setTimeout(() => setNow(new Date()), 0);
    return () => clearTimeout(first);
  }, []);

  if (!now) return null;

  const deadline = resolveDeadline(override, now);
  const { days: totalDays } = getTimeLeft(deadline, now);
  if (totalDays > SHOW_WITHIN_DAYS) return null;

  const dateLabel = deadline.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <GlobalAlert status="announcement" as="div" size="small">
      <GlobalAlert.Header>
        <GlobalAlert.Title as="h2">
          Tilgjengelighetserklæring: ca. {dateLabel}
        </GlobalAlert.Title>
      </GlobalAlert.Header>
      <GlobalAlert.Content>
        <div className={styles.content}>
          <span>Vi håper alle team er i mål om cirka</span>
          <span className={styles.unit}>
            <span className={styles.value}>{totalDays}</span>
            <span className={styles.label}>
              {plural(totalDays, "dag", "dager")}
            </span>
          </span>
          <span>
            Lurer du på noe? Ta kontakt i{" "}
            <Link href="https://nav-it.slack.com/archives/C7MANSGLS">
              #nav-uu
            </Link>
            .
          </span>
        </div>
      </GlobalAlert.Content>
    </GlobalAlert>
  );
}

export default DeadlineCountdown;
