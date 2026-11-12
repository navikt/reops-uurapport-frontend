"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Button,
  DatePicker,
  Loader,
  LocalAlert,
  useDatepicker,
} from "@navikt/ds-react";
import { resolveDeadline } from "@src/utils/client/deadline";
import { updateDeadline } from "@src/services/deadlineServices";
import { useDeadlineOverride } from "./useDeadline";
import styles from "./DeadlineCountdown.module.css";

const toIsoDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

function DeadlineForm({
  initialDeadline,
  onSave,
  onChange,
}: {
  initialDeadline: Date;
  onSave: (deadline: string) => Promise<void>;
  onChange: () => void;
}) {
  const [error, setError] = useState<string>();
  const pending = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const flush = useCallback(() => {
    clearTimeout(timer.current);
    const deadline = pending.current;
    pending.current = null;
    if (deadline) void onSave(deadline);
  }, [onSave]);

  useEffect(() => () => flush(), [flush]);

  const { datepickerProps, inputProps } = useDatepicker({
    fromDate: new Date(),
    defaultSelected: initialDeadline,
    required: true,
    allowTwoDigitYear: false,
    onDateChange: (date) => {
      clearTimeout(timer.current);
      onChange();
      pending.current = date ? toIsoDate(date) : null;
      if (date) timer.current = setTimeout(flush, 500);
    },
    onValidate: (validation) =>
      setError(
        validation.isValidDate
          ? undefined
          : validation.isEmpty
            ? "Du må velge en frist."
            : validation.isBefore
              ? "Velg en dato fra og med i dag."
              : "Skriv en gyldig dato (dd.mm.åååå).",
      ),
  });

  return (
    <form
      className={styles.settingsForm}
      onSubmit={(event) => {
        event.preventDefault();
        flush();
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) flush();
      }}
    >
      <DatePicker {...datepickerProps}>
        <DatePicker.Input
          {...inputProps}
          label="Frist for tilgjengelighetserklæring"
          description="Lagres automatisk og gjentas på samme dato hvert år."
          error={error}
        />
      </DatePicker>
    </form>
  );
}

function DeadlineSettings() {
  const { override, mutate, isLoading, error } = useDeadlineOverride();
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const queue = useRef(Promise.resolve());
  const revision = useRef(0);
  const lastAttempt = useRef<string | null>(null);
  const onChange = useCallback(() => {
    revision.current++;
    setStatus("idle");
  }, []);

  const save = useCallback(
    (deadline: string) => {
      const attemptRevision = revision.current;
      lastAttempt.current = deadline;
      setStatus("saving");
      // Serialize writes so a slow request cannot overwrite a more recent edit.
      const task = queue.current.then(async () => {
        try {
          await updateDeadline(deadline);
          await mutate({ deadline }, { revalidate: false });
          if (revision.current === attemptRevision) setStatus("saved");
        } catch {
          if (revision.current === attemptRevision) setStatus("error");
        }
      });
      queue.current = task;
      return task;
    },
    [mutate],
  );

  return (
    <section className={styles.settings} aria-label="Fristinnstillinger">
      {isLoading ? (
        <Loader title="Laster fristen" />
      ) : error ? (
        <LocalAlert status="error">
          <LocalAlert.Header>
            <LocalAlert.Title>Kunne ikke laste fristen</LocalAlert.Title>
          </LocalAlert.Header>
          <LocalAlert.Content>
            <Button
              variant="secondary"
              size="small"
              onClick={() => void mutate()}
            >
              Prøv igjen
            </Button>
          </LocalAlert.Content>
        </LocalAlert>
      ) : (
        <DeadlineForm
          initialDeadline={resolveDeadline(override, new Date())}
          onSave={save}
          onChange={onChange}
        />
      )}
      <div role="status" className={styles.saveStatus}>
        {status === "saving" && "Lagrer…"}
        {status === "saved" && "Fristen er lagret."}
      </div>
      {status === "error" && (
        <LocalAlert status="error">
          <LocalAlert.Header>
            <LocalAlert.Title>Kunne ikke lagre fristen</LocalAlert.Title>
          </LocalAlert.Header>
          <LocalAlert.Content>
            <Button
              variant="secondary"
              size="small"
              onClick={() => {
                if (lastAttempt.current) void save(lastAttempt.current);
              }}
            >
              Prøv igjen
            </Button>
          </LocalAlert.Content>
        </LocalAlert>
      )}
    </section>
  );
}

export default DeadlineSettings;
