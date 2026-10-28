"use client";
import { useState } from "react";
import { TrashIcon } from "@navikt/aksel-icons";
import {
  BodyLong,
  Button,
  LocalAlert,
  Modal,
  TextField,
} from "@navikt/ds-react";
import { deleteReport } from "@src/services/reportServices";
import styles from "../Modal.module.css";

interface DeleteReportModalProps {
  reportId: string;
  reportName: string;
  isArchived?: boolean;
  size?: "medium" | "small";
  onDeleted: () => void;
}

type Step = "closed" | "warning" | "confirm";

const MAX_TYPED_NAME_LENGTH = 40;

/**
 * Permanent deletion is irreversible, so it takes two deliberate steps:
 * 1. a warning dialog that explains the consequences (Avbryt has focus), and
 * 2. a second dialog where the admin must type the report name before the
 *    delete button is enabled.
 * Dialogs are only mounted while open to keep long lists light.
 */
const DeleteReportModal = ({
  reportId,
  reportName,
  isArchived = false,
  size = "medium",
  onDeleted,
}: DeleteReportModalProps) => {
  const [step, setStep] = useState<Step>("closed");
  const [typedName, setTypedName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(false);

  const trimmedName = reportName.trim();
  const confirmationText =
    trimmedName.length > 0 && trimmedName.length <= MAX_TYPED_NAME_LENGTH
      ? trimmedName
      : "slett";

  const close = () => {
    setStep("closed");
    setTypedName("");
    setError(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(false);
    try {
      await deleteReport(reportId);
      close();
      onDeleted();
    } catch {
      setError(true);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Button
        data-color="danger"
        variant="secondary"
        size={size}
        icon={<TrashIcon aria-hidden />}
        className={styles.button}
        aria-label={`Slett ${reportName} permanent`}
        onClick={() => setStep("warning")}
      >
        Slett permanent
      </Button>

      {step === "warning" && (
        <Modal
          open
          portal
          onClose={close}
          header={{ heading: "Slette rapporten permanent?" }}
        >
          <Modal.Body className={styles.modalFields}>
            <LocalAlert status="warning">
              <LocalAlert.Header>
                <LocalAlert.Title as="h3">
                  Dette kan ikke angres
                </LocalAlert.Title>
              </LocalAlert.Header>
              <LocalAlert.Content>
                Rapporten «{reportName}» og hele endringshistorikken slettes for
                godt. Det finnes ingen måte å hente dem tilbake på.
              </LocalAlert.Content>
            </LocalAlert>
            {!isArchived && (
              <BodyLong>
                Vurder å arkivere rapporten i stedet. Da skjules den fra
                listene, og den kan gjenopprettes senere.
              </BodyLong>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button type="button" variant="secondary" autoFocus onClick={close}>
              Avbryt
            </Button>
            <Button
              data-color="danger"
              type="button"
              variant="secondary"
              onClick={() => setStep("confirm")}
            >
              Fortsett
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {step === "confirm" && (
        <Modal
          open
          portal
          onClose={close}
          header={{ heading: "Bekreft permanent sletting" }}
        >
          <Modal.Body className={styles.modalFields}>
            <TextField
              label={`Skriv «${confirmationText}» for å bekrefte`}
              description="Sletteknappen er deaktivert til teksten stemmer."
              value={typedName}
              autoComplete="off"
              onChange={(event) => setTypedName(event.target.value)}
            />
            {error && (
              <LocalAlert status="error" role="alert">
                <LocalAlert.Header>
                  <LocalAlert.Title as="h3">
                    Kunne ikke slette rapporten
                  </LocalAlert.Title>
                </LocalAlert.Header>
                <LocalAlert.Content>Prøv igjen.</LocalAlert.Content>
              </LocalAlert>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button type="button" variant="secondary" onClick={close}>
              Avbryt
            </Button>
            <Button
              data-color="danger"
              type="button"
              variant="primary"
              loading={isDeleting}
              disabled={typedName.trim() !== confirmationText}
              onClick={handleDelete}
            >
              Slett permanent
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
};

export default DeleteReportModal;
