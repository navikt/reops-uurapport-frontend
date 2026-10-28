"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Modal,
  Select,
  TextField,
  Checkbox,
  LocalAlert,
} from "@navikt/ds-react";
import { createReport } from "@src/services/reportServices";
import { FilePlusIcon } from "@navikt/aksel-icons";
import { fetcher } from "@src/utils/client/api";
import useSWRImmutable from "swr/immutable";
import type { InitialReport, Team } from "@src/types";
import styles from "../Modal.module.css";
import { apiProxyUrl } from "@src/utils/client/urls";

interface CreateReportModalProps {
  /** Team to preselect in the team dropdown (e.g. the team currently viewed). */
  preselectedTeamId?: string;
}

const CreateReportModal = ({ preselectedTeamId }: CreateReportModalProps) => {
  const ref = useRef<HTMLDialogElement>(null);
  const [reportDetails, setReportDetails] = useState<InitialReport>({
    name: "",
    urlTilSiden: "",
    teamId: preselectedTeamId ?? "",
    isPartOfNavNo: true,
  });
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [createFailed, setCreateFailed] = useState(false);

  const handleSubmit = async () => {
    setIsSaving(true);
    setCreateFailed(false);
    try {
      const reportId = await createReport(reportDetails);
      ref.current?.close();
      router.push(`/reports/${reportId}`);
    } catch {
      setCreateFailed(true);
    } finally {
      setIsSaving(false);
    }
  };

  const { data: userDetails } = useSWRImmutable(
    { url: `${apiProxyUrl}/users/details` },
    fetcher,
  );

  // Only prefill teams the user is actually a member of.
  const prefillIsValid = userDetails?.teams.some(
    (team: Team) => team.id === reportDetails.teamId,
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setReportDetails({
      ...reportDetails,
      [e.target.name]: e.target.value,
    });
  };

  const handleCheckboxChange = () => {
    setReportDetails({
      ...reportDetails,
      isPartOfNavNo: !reportDetails.isPartOfNavNo,
    });
  };

  const isValid =
    reportDetails.name && reportDetails.urlTilSiden && reportDetails.teamId;
  return (
    <div>
      <Button
        type="button"
        icon={<FilePlusIcon />}
        onClick={() => {
          ref.current?.showModal();
          console.log("Modal opened");
        }}
      >
        Opprett en ny rapport
      </Button>
      <Modal
        ref={ref}
        portal
        header={{ heading: "Opprett rapport" }}
        closeOnBackdropClick={true}
      >
        <Modal.Body className={styles.modalBody}>
          <TextField
            label="Tittel"
            type="text"
            id="title"
            name="name"
            onChange={handleChange}
          />
          <TextField
            label="URL"
            description="URL til siden som rapporten gjelder for."
            type="text"
            id="url"
            name="urlTilSiden"
            onChange={handleChange}
          />
          <Checkbox
            description="Hvis rapporten er for en applikasjon som er en del av nav.no, huk av her."
            name="isPartOfNavNo"
            onChange={handleCheckboxChange}
            checked={reportDetails.isPartOfNavNo}
          >
            Tjenesten er under nav.no
          </Checkbox>
          <Select
            label="Hvilket team er ansvarlig for løsningen?"
            name="teamId"
            value={prefillIsValid ? reportDetails.teamId : ""}
            onChange={handleChange}
          >
            <option value="">Velg team</option>
            {userDetails?.teams.map((team: Team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </Select>
          {createFailed && (
            <LocalAlert status="error" role="alert">
              <LocalAlert.Header>
                <LocalAlert.Title as="h3">
                  Kunne ikke opprette rapporten
                </LocalAlert.Title>
              </LocalAlert.Header>
              <LocalAlert.Content>Prøv igjen.</LocalAlert.Content>
            </LocalAlert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            type="submit"
            disabled={!isValid}
            loading={isSaving}
            onClick={handleSubmit}
          >
            Opprett rapport
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

export default CreateReportModal;
