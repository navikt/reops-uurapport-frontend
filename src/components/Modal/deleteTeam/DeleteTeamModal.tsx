"use client";
import { TrashIcon } from "@navikt/aksel-icons";
import { Modal, Button, BodyLong } from "@navikt/ds-react";
import { deleteTeam } from "@src/services/teamServices";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "../Modal.module.css";

interface DeleteTeamModalProps {
  teamId: string;
  /** Button size for the trigger (e.g. "small" inside tables). */
  size?: "medium" | "small" | "xsmall";
}

const DeleteTeamModal = ({ teamId, size }: DeleteTeamModalProps) => {
  const ref = useRef<HTMLDialogElement>(null);
  const router = useRouter();

  const handleDelete = async () => {
    try {
      await deleteTeam(teamId);
      ref.current?.close();
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <Button
        data-color="danger"
        variant="primary"
        size={size}
        icon={<TrashIcon aria-hidden />}
        className={styles.button}
        onClick={() => ref.current?.showModal()}
      >
        Slett
      </Button>
      <Modal ref={ref} header={{ heading: "Slett team" }}>
        <Modal.Body>
          <BodyLong>Er du sikker på at du vil slette dette teamet?</BodyLong>
        </Modal.Body>
        <Modal.Footer>
          <Button
            data-color="danger"
            type="button"
            variant="primary"
            onClick={handleDelete}
          >
            Slett
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
    </div>
  );
};

export default DeleteTeamModal;
