"use client";
import { useId, useRef, useState } from "react";
import { Button, LocalAlert, Modal, TextField } from "@navikt/ds-react";
import { PlusIcon, XMarkIcon } from "@navikt/aksel-icons";
import { TeamRequestError } from "@src/services/teamServices";
import styles from "../Modal.module.css";

export type TeamFormValues = {
  name: string;
  email: string;
  members: string[];
};

interface TeamFormModalProps {
  heading: string;
  submitLabel: string;
  errorTitle: string;
  /** Values the form starts with. Read once, when the modal opens. */
  initialValues: TeamFormValues;
  /** Throw to show an error in the modal. Resolve to close it. */
  onSubmit: (values: TeamFormValues) => Promise<void>;
  onClose: () => void;
}

/**
 * The one team form, shared by "Legg til team" and "Rediger team".
 * Mount it only while open: its state then starts fresh from `initialValues`
 * every time, and nothing needs resetting on cancel.
 */
const TeamFormModal = ({
  heading,
  submitLabel,
  errorTitle,
  initialValues,
  onSubmit,
  onClose,
}: TeamFormModalProps) => {
  const formId = useId();
  const addMemberButtonRef = useRef<HTMLButtonElement>(null);
  const [name, setName] = useState(initialValues.name);
  const [email, setEmail] = useState(initialValues.email);
  const [members, setMembers] = useState(initialValues.members);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = name.trim() !== "" && email.trim() !== "";

  const updateMember = (index: number, value: string) =>
    setMembers(members.map((member, i) => (i === index ? value : member)));

  const removeMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
    // The focused button is removed with its row; keep focus nearby.
    addMemberButtonRef.current?.focus();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      await onSubmit({
        name: name.trim(),
        email: email.trim(),
        members: members.map((member) => member.trim()).filter(Boolean),
      });
    } catch (cause) {
      console.error(cause);
      setError(
        cause instanceof TeamRequestError
          ? `Serveren svarte med feilkode ${cause.status}.`
          : "Kunne ikke nå serveren.",
      );
      setIsSaving(false);
    }
  };

  return (
    <Modal open portal onClose={onClose} width="medium" header={{ heading }}>
      <Modal.Body>
        <form
          id={formId}
          onSubmit={handleSubmit}
          className={styles.modalFields}
        >
          <TextField
            label="Teamnavn"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Team Eksempel"
          />
          <TextField
            label="E-postadresse til teameier"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ola.nordmann@nav.no"
          />

          {members.map((member, index) => (
            <div key={index} className={styles.memberRow}>
              <TextField
                className={styles.memberField}
                label={`E-postadresse til medlem ${index + 1}`}
                type="email"
                value={member}
                placeholder="ola.nordmann@nav.no"
                onChange={(e) => updateMember(index, e.target.value)}
              />
              <Button
                type="button"
                variant="tertiary"
                icon={<XMarkIcon aria-hidden />}
                aria-label={`Fjern medlem ${index + 1}`}
                onClick={() => removeMember(index)}
              >
                Fjern
              </Button>
            </div>
          ))}

          <div>
            <Button
              ref={addMemberButtonRef}
              type="button"
              variant="tertiary"
              icon={<PlusIcon aria-hidden />}
              onClick={() => setMembers([...members, ""])}
            >
              Legg til medlem
            </Button>
          </div>

          {error && (
            <LocalAlert status="error" role="alert">
              <LocalAlert.Header>
                <LocalAlert.Title as="h3">{errorTitle}</LocalAlert.Title>
              </LocalAlert.Header>
              <LocalAlert.Content>
                {error} Prøv igjen, og si fra hvis det fortsetter.
              </LocalAlert.Content>
            </LocalAlert>
          )}
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button
          type="submit"
          form={formId}
          disabled={!isValid}
          loading={isSaving}
        >
          {submitLabel}
        </Button>
        <Button type="button" variant="secondary" onClick={onClose}>
          Avbryt
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TeamFormModal;
