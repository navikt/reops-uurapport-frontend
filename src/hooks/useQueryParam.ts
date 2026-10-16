"use client";

import { useCallback, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface UseQueryParamOptions {
  /**
   * Use `push` instead of `replace` so the change creates a history entry
   * (e.g. tab switches where back-button should return to previous tab).
   */
  history?: "push" | "replace";
}

/**
 * Syncs a single piece of state with a URL search param.
 * - Value comes from the URL if present, else `defaultValue`.
 * - Follows back/forward navigation automatically (URL is source of truth).
 * - Local state exists only to bridge the gap between user action and the
 *   URL update being reflected in `useSearchParams`.
 * - `undefined` value removes the param from the URL.
 */
export function useQueryParam(
  key: string,
  defaultValue: string,
  options?: UseQueryParamOptions,
): [string, (value: string | undefined) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const fromUrl = searchParams.get(key) ?? defaultValue;
  const [local, setLocal] = useState<{ url: string; value: string } | null>(
    null,
  );

  // Local override only valid until the URL catches up.
  const value = local !== null && local.url === fromUrl ? local.value : fromUrl;

  const set = useCallback(
    (next: string | undefined) => {
      const nextValue = next ?? defaultValue;
      setLocal({ url: nextValue, value: nextValue });
      const params = new URLSearchParams(searchParams.toString());
      if (next === undefined || next === defaultValue) {
        params.delete(key);
      } else {
        params.set(key, next);
      }
      const query = params.toString();
      const url = query ? `${pathname}?${query}` : pathname;
      if (options?.history === "push") {
        router.push(url, { scroll: false });
      } else {
        router.replace(url, { scroll: false });
      }
    },
    [defaultValue, key, options?.history, pathname, router, searchParams],
  );

  return [value, set];
}

/**
 * Multi-value variant: param stored as comma-separated list.
 */
export function useQueryParamList(
  key: string,
  options?: UseQueryParamOptions,
): [string[], (value: string[]) => void] {
  const [raw, setRaw] = useQueryParam(key, "", options);
  const list = raw === "" ? [] : raw.split(",");
  const set = useCallback(
    (next: string[]) => {
      setRaw(next.length === 0 ? undefined : next.join(","));
    },
    [setRaw],
  );
  return [list, set];
}
