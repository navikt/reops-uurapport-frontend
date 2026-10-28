"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArchiveIcon } from "@navikt/aksel-icons";
import {
  BodyShort,
  Button,
  LocalAlert,
  Modal,
  Textarea,
} from "@navikt/ds-react";
import { archiveReport } from "@src/services/reportServices";
import DeletionContacts from "@components/DeletionContacts/DeletionContacts";
import styles from "../Modal.module.css";

interface ArchiveReportModalProps {
  reportId: string;
}

const MAX_REASON_LENGTH = 500;

const ArchiveReportModal = ({ reportId }: ArchiveReportModalProps) => {
  const ref = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(false);

  const handleArchive = async () => {
    setIsSaving(true);
    setError(false);
    try {
      await archiveReport(reportId, reason);
      ref.current?.close();
      router.refresh();
    } catch {
      setError(true);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Button
        variant="secondary"
        icon={<ArchiveIcon aria-hidden />}
        className={styles.button}
        onClick={() => ref.current?.showModal()}
      >
        Arkiver rapport
      </Button>
      <Modal ref={ref} portal header={{ heading: "Arkiver rapport" }}>
        <Modal.Body className={styles.modalFields}>
          <BodyShort>
            Rapporten vises ikke lenger i rapportlistene, men den slettes ikke.
            Du kan gjenopprette den fra «Arkiverte rapporter».
          </BodyShort>
          <Textarea
            label="Årsak (valgfritt)"
            value={reason}
            maxLength={MAX_REASON_LENGTH}
            onChange={(event) => setReason(event.target.value)}
          />
          <DeletionContacts />
          {error && (
            <LocalAlert status="error" role="alert">
              <LocalAlert.Header>
                <LocalAlert.Title>
                  Kunne ikke arkivere rapporten
                </LocalAlert.Title>
              </LocalAlert.Header>
              <LocalAlert.Content>Prøv igjen.</LocalAlert.Content>
            </LocalAlert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button type="button" loading={isSaving} onClick={handleArchive}>
            Arkiver
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => ref.current?.close()}
          >
            Avbryt
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ArchiveReportModal;
