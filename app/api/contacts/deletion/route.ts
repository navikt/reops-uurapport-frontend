import { NextResponse } from "next/server";
import { isMock } from "@/utils/server/environment";
import { apiUrl } from "@/utils/server/urls";
import { getDeletionContacts } from "@/utils/server/teamkatalog";
import type { DeletionContacts } from "@src/types";

export async function GET() {
  // Mock data lives in mock/server.ts, like all other mock data.
  if (isMock) {
    return NextResponse.json(
      await (await fetch(`${apiUrl}/api/contacts/deletion`)).json(),
    );
  }

  try {
    return NextResponse.json(await getDeletionContacts());
  } catch (error) {
    console.error(
      "Could not fetch deletion contacts from Teamkatalogen",
      error,
    );
    const empty: DeletionContacts = { contacts: [], slackChannelId: null };
    return NextResponse.json(empty);
  }
}
