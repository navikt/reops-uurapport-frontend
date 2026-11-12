"use client";

import { Pagination } from "@navikt/ds-react";
import { REPORTS_PER_PAGE } from "@src/hooks/usePagination";
import styles from "./ReportList.module.css";

export default function ReportPagination({
  total,
  page,
  onPageChange,
  label = "Sider med rapporter",
}: {
  total: number;
  page: number;
  onPageChange: (page: number) => void;
  label?: string;
}) {
  if (total <= REPORTS_PER_PAGE) return null;
  return (
    <div className={styles.pagination}>
      <p role="status">
        {(page - 1) * REPORTS_PER_PAGE + 1}–
        {Math.min(page * REPORTS_PER_PAGE, total)} av {total} rapporter
      </p>
      <Pagination
        size="small"
        page={page}
        count={Math.ceil(total / REPORTS_PER_PAGE)}
        onPageChange={onPageChange}
        siblingCount={0}
        srHeading={{ tag: "h2", text: label }}
      />
    </div>
  );
}
