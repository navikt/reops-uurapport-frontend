"use client";

import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import type { User } from "@src/types";
import { useQueryParam } from "./useQueryParam";

const changeEvent = "uurapport:selected-team";
const serverSnapshot = () => undefined;

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(changeEvent, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(changeEvent, onChange);
  };
}

export function useSelectedTeam(user: Pick<User, "email" | "teams">) {
  const storageKey = `uurapport:selected-team:${user.email}`;
  const getSnapshot = useCallback(() => {
    try {
      return window.localStorage.getItem(storageKey);
    } catch {
      return null;
    }
  }, [storageKey]);
  const rememberedTeam = useSyncExternalStore(
    subscribe,
    getSnapshot,
    serverSnapshot,
  );
  const defaultTeam =
    user.teams.find((team) => team.id === rememberedTeam)?.id ??
    user.teams[0]?.id ??
    "";
  const selection = useQueryParam("team", defaultTeam);
  const [currentTeam] = selection;
  const lastSelection = useRef<{ key: string; team: string } | null>(null);

  useEffect(() => {
    // Undefined is the server snapshot: do not overwrite a saved choice during hydration.
    if (
      rememberedTeam === undefined ||
      !user.teams.some((team) => team.id === currentTeam)
    )
      return;
    // Another tab's preference change must not make explicit URLs fight each other.
    if (
      lastSelection.current?.key === storageKey &&
      lastSelection.current.team === currentTeam
    )
      return;
    lastSelection.current = { key: storageKey, team: currentTeam };
    if (rememberedTeam === currentTeam) return;
    try {
      window.localStorage.setItem(storageKey, currentTeam);
      window.dispatchEvent(new Event(changeEvent));
    } catch {
      // URL selection still works when browser storage is unavailable.
    }
  }, [currentTeam, rememberedTeam, storageKey, user.teams]);

  return selection;
}
