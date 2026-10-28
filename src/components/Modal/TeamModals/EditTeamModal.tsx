"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@navikt/ds-react";
import { PersonPencilIcon } from "@navikt/aksel-icons";
import useSWR, { mutate as globalMutate } from "swr";
import { updateTeam } from "@src/services/teamServices";
import { fetcher } from "@src/utils/client/api";
import { apiProxyUrl } from "@src/utils/client/urls";
import type { Team } from "@src/types";
import TeamFormModal from "./TeamFormModal";

interface EditTeamModalProps {
  teamId: string;
  /** Button size for the trigger (e.g. "small" inside tables). */
  size?: "medium" | "small" | "xsmall";
}

function EditTeamModal({ teamId, size }: EditTeamModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const { data: team, mutate } = useSWR<Team>(
    { url: `${apiProxyUrl}/teams/${teamId}` },
    fetcher,
  );

  return (
    <div>
      <Button
        variant="secondary"
        size={size}
        onClick={() => setIsOpen(true)}
        icon={<PersonPencilIcon aria-hidden />}
      >
        Rediger
      </Button>
      {isOpen && team && (
        <TeamFormModal
          heading="Rediger team"
          submitLabel="Lagre"
          errorTitle="Kunne ikke lagre teamet"
          initialValues={{
            name: team.name,
            email: team.email,
            members: team.members ?? [],
          }}
          onSubmit={async (values) => {
            await updateTeam(teamId, { id: team.id, ...values });
            await mutate();
            router.refresh();
            // Membership may have changed which teams the user belongs to.
            await globalMutate({ url: `${apiProxyUrl}/users/details` });
            setIsOpen(false);
          }}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

export default EditTeamModal;
