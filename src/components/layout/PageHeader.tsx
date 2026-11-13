import type { ReactNode } from "react";
import styles from "./PageHeader.module.css";

interface PageHeaderProps {
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ children, actions, className }: PageHeaderProps) {
  return (
    <div className={[styles.header, className].filter(Boolean).join(" ")}>
      <div className={styles.title}>{children}</div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  );
}
