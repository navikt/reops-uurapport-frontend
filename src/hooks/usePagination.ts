"use client";

import { useState } from "react";

export const REPORTS_PER_PAGE = 25;

export function usePagination<T>(items: T[], resetKey: string) {
  const [selection, setSelection] = useState({ key: resetKey, page: 1 });
  const count = Math.max(1, Math.ceil(items.length / REPORTS_PER_PAGE));
  const page =
    selection.key === resetKey
      ? Math.max(1, Math.min(selection.page, count))
      : 1;
  // Persist resets: otherwise clearing a filter can revive its old page.
  if (selection.key !== resetKey || selection.page !== page) {
    setSelection({ key: resetKey, page });
  }
  return {
    page,
    items: items.slice((page - 1) * REPORTS_PER_PAGE, page * REPORTS_PER_PAGE),
    onPageChange: (page: number) => setSelection({ key: resetKey, page }),
  };
}
