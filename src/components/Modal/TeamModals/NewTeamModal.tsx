"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AddOrgBtn from "@components/buttons/AddOrgBtn";
import { apiProxyUrl } from "@src/utils/client/urls";
import { createNewTeam } from "@src/services/teamServices";
import useSWRImmutable from "swr/immutable";
import { fetcher } from "@src/utils/client/api";
import TeamFormModal from "./TeamFormModal";

function NewTeamModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const { data: userDetails, mutate } = useSWRImmutable(
    { url: `${apiProxyUrl}/users/details` },
    fetcher,
  );

  return (
    <div>
      <AddOrgBtn onClick={() => setIsOpen(true)} />
      {isOpen && (
        <TeamFormModal
          heading="Legg til team"
          submitLabel="Opprett team"
          errorTitle="Kunne ikke opprette teamet"
          initialValues={{
            name: "",
            email: userDetails?.email ?? "",
            members: [""],
          }}
          onSubmit={async (values) => {
            await createNewTeam(values);
            // The user's team list is cached; refresh it so the new team is selectable.
            await mutate();
            router.refresh();
            setIsOpen(false);
          }}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

export default NewTeamModal;
