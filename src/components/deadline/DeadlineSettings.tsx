"use client";
import { useState } from "react";
import {
  Alert,
  Button,
  DatePicker,
  Heading,
  useDatepicker,
} from "@navikt/ds-react";
import { nextDefaultDeadline } from "@src/utils/client/deadline";
import { updateDeadline } from "@src/services/deadlineServices";
import { useDeadlineOverride } from "./useDeadline";
import styles from "./DeadlineCountdown.module.css";

const toIsoDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const fromIsoDate = (iso: string) => {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
};

function DeadlineSettings() {
  const { override, mutate } = useDeadlineOverride();
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");

  const defaultDate = nextDefaultDeadline(new Date());

  const { datepickerProps, inputProps, selectedDay, setSelected } =
    useDatepicker({
      fromDate: new Date(),
      defaultSelected: override ? fromIsoDate(override) : undefined,
      onDateChange: () => setStatus("idle"),
    });

  const save = async (deadline: string | null) => {
    try {
      await updateDeadline(deadline);
      await mutate({ deadline }, { revalidate: false });
      if (!deadline) setSelected(undefined);
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className={styles.settings}>
      <Heading level="2" size="small">
        Frist for tilgjengelighetserklæring
      </Heading>
      <div className={styles.settingsForm}>
        <DatePicker {...datepickerProps}>
          <DatePicker.Input
            {...inputProps}
            label="Ny frist"
            description={`Standard er 20. desember (${defaultDate.getFullYear()}). Etter fristen går telleren tilbake til standard.`}
          />
        </DatePicker>
        <Button
          disabled={!selectedDay}
          onClick={() => selectedDay && save(toIsoDate(selectedDay))}
        >
          Lagre
        </Button>
        <Button
          variant="secondary"
          disabled={!override}
          onClick={() => save(null)}
        >
          Tilbakestill til standard
        </Button>
      </div>
      <div aria-live="polite">
        {status === "saved" && (
          <Alert variant="success" size="small">
            Fristen er oppdatert.
          </Alert>
        )}
        {status === "error" && (
          <Alert variant="error" size="small">
            Kunne ikke lagre fristen. Prøv igjen.
          </Alert>
        )}
      </div>
    </section>
  );
}

export default DeadlineSettings;
