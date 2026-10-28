"use client";
import { BodyShort, Box, Heading, Link, ReadMore } from "@navikt/ds-react";
import useSWRImmutable from "swr/immutable";
import { fetcher } from "@src/utils/client/api";
import { apiProxyUrl } from "@src/utils/client/urls";
import styles from "./DeletionContacts.module.css";
import type {
  AdminContact,
  DeletionContacts as DeletionContactsData,
} from "@src/types";

const SLACK_CHANNEL_NAME = "#nav-uu";
const SLACK_WORKSPACE_URL = "https://nav-it.slack.com";
const SLACK_ID_PATTERN = /^[A-Z0-9]{8,}$/;

const joinNames = (names: string[]) =>
  names.length <= 1
    ? (names[0] ?? "")
    : `${names.slice(0, -1).join(", ")} og ${names[names.length - 1]}`;

interface DeletionContactsProps {
  /** Heading level, so it fits under the surrounding heading. */
  headingLevel?: "2" | "3";
}

const DeletionContacts = ({ headingLevel = "3" }: DeletionContactsProps) => {
  const { data } = useSWRImmutable<DeletionContactsData>(
    { url: "/api/contacts/deletion" },
    fetcher,
  );

  const { data: admins } = useSWRImmutable<AdminContact[]>(
    { url: `${apiProxyUrl}/admins` },
    fetcher,
  );

  const slackUrl =
    data?.slackChannelId && SLACK_ID_PATTERN.test(data.slackChannelId)
      ? `${SLACK_WORKSPACE_URL}/archives/${data.slackChannelId}`
      : null;

  const slack = slackUrl ? (
    <Link href={slackUrl}>{SLACK_CHANNEL_NAME} på Slack</Link>
  ) : (
    <>{SLACK_CHANNEL_NAME} på Slack</>
  );

  const names = data?.contacts.map((contact) => contact.fullName) ?? [];
  const roleLabel =
    data?.contacts[0]?.role === "kontaktperson"
      ? "Kontaktperson"
      : names.length > 1
        ? "Teamledere"
        : "Teamleder";

  return (
    <Box background="sunken" padding="space-16" borderRadius="8">
      <div className={styles.contacts}>
        <Heading level={headingLevel} size="xsmall">
          Permanent sletting
        </Heading>
        <BodyShort size="small">
          Bare administratorer kan slette rapporter permanent.{" "}
          {names.length > 0 ? (
            <>
              {roleLabel} for universell utforming er {joinNames(names)}. Du kan
              også spørre i {slack}.
            </>
          ) : (
            <>Spør i {slack}.</>
          )}
        </BodyShort>
        {admins && admins.length > 0 && (
          <ReadMore header="Hvem er administratorer?" size="small">
            {joinNames(admins.map((admin) => admin.name ?? admin.email))}
          </ReadMore>
        )}
      </div>
    </Box>
  );
};

export default DeletionContacts;
