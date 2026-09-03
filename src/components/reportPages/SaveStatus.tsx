import { useEffect, useRef, useState } from "react";
import { CheckmarkCircleIcon } from "@navikt/aksel-icons";
import styles from "./SaveStatus.module.css";

export type SaveState = "idle" | "saving" | "saved" | "error";

// Show "Lagrer…" only when a save takes this long — saves faster than this
// complete before anyone can read the message, and the flicker is noise.
const SAVING_DELAY_MS = 1500;

const formatTime = (date: Date) =>
  date.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });

/**
 * Persistent save-status indicator for autosaved forms.
 *
 * WCAG rationale:
 * - 2.2.1: never auto-dismisses — persists until the state changes.
 * - 4.1.3: failures go to a role="alert" (assertive) region immediately.
 *   The autosave pattern is announced politely once (first successful
 *   save) — after that the visible indicator carries the information, so
 *   screen reader users are not spammed with "lagret, lagret, lagret".
 * - "Lagrer…" appears only for saves slower than ~1.5s; faster saves skip
 *   it to avoid a flicker nobody can read.
 * - Position is fixed bottom-right so the status stays visible on long
 *   forms without moving focus or restructuring the page (3.2.2).
 */
const SaveStatus = ({ state }: { state: SaveState }) => {
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [showSaving, setShowSaving] = useState(false);
  const hasAnnouncedSave = useRef(false);
  const [politeMessage, setPoliteMessage] = useState("");

  useEffect(() => {
    if (state === "saved") {
      const timer = setTimeout(() => setLastSavedAt(new Date()), 0);
      return () => clearTimeout(timer);
    }
  }, [state]);

  useEffect(() => {
    if (state !== "saving") {
      const timer = setTimeout(() => setShowSaving(false), 0);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => setShowSaving(true), SAVING_DELAY_MS);
    return () => clearTimeout(timer);
  }, [state]);

  useEffect(() => {
    if (state !== "saved" || hasAnnouncedSave.current) return;
    // Announce the first successful save so SR users learn the autosave
    // pattern; later saves are silent (visible indicator carries it).
    const timer = setTimeout(() => {
      setPoliteMessage("Alle endringer lagres automatisk og er lagret.");
      hasAnnouncedSave.current = true;
    }, 0);
    return () => clearTimeout(timer);
  }, [state]);

  const visibleText =
    state === "error"
      ? "Kunne ikke lagre — endringene dine er ikke lagret. Prøv igjen."
      : showSaving
        ? "Lagrer…"
        : lastSavedAt
          ? `Alle endringer lagret kl. ${formatTime(lastSavedAt)}`
          : "Svarene dine lagres automatisk.";

  return (
    <div className={styles.saveStatus} data-state={state}>
      <p
        className={`${styles.statusText} ${state === "error" ? styles.error : ""}`}
      >
        {state === "saved" && !showSaving && (
          <CheckmarkCircleIcon
            aria-hidden
            fontSize="1.5rem"
            className={styles.successIcon}
          />
        )}
        {visibleText}
      </p>
      {/* Polite: one-time explanation of the autosave pattern */}
      <div role="status" aria-live="polite" className={styles.visuallyHidden}>
        {politeMessage}
      </div>
      {/* Assertive: failures always interrupt */}
      <div role="alert" className={styles.visuallyHidden}>
        {state === "error"
          ? "Lagring feilet. Endringene dine ble ikke lagret. Prøv igjen."
          : ""}
      </div>
    </div>
  );
};

export default SaveStatus;
