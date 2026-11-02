"use client";
import useSWR from "swr";
import { fetcher } from "@src/utils/client/api";
import { apiProxyUrl } from "@src/utils/client/urls";

export const DEADLINE_KEY = { url: `${apiProxyUrl}/deadline` };

export const useDeadlineOverride = () => {
  const { data, mutate } = useSWR<{ deadline: string | null }>(
    DEADLINE_KEY,
    fetcher,
  );
  return { override: data?.deadline ?? null, mutate };
};
