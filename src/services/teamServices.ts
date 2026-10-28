import type { NewTeam, Team } from "@src/types";
import { apiProxyUrl } from "@src/utils/client/urls";

export class TeamRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export const updateTeam = async (teamId: string, updates: Team) => {
  // PATCH, not PUT: the backend's CORS config only allows PATCH, so PUT is
  // rejected (403) when the browser calls the backend directly (local mode).
  const response = await fetch(`${apiProxyUrl}/teams/${teamId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
    credentials: "include",
  });
  if (response.ok) {
    console.log("Team updated", response.status);
  } else {
    throw new TeamRequestError("Failed to update team", response.status);
  }
};

export const createNewTeam = async (newTeam: NewTeam) => {
  const response = await fetch(`${apiProxyUrl}/teams/new`, {
    method: "POST",
    body: JSON.stringify(newTeam),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new TeamRequestError("Failed to create team", response.status);
  }
};

export const deleteTeam = async (teamId: string) => {
  const response = await fetch(`${apiProxyUrl}/admin/teams/${teamId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (response.ok) {
    console.log("Team deleted", response.status);
  } else {
    console.log("Failed to delete team-", response.status);
    throw new Error("Failed to delete team");
  }
};
