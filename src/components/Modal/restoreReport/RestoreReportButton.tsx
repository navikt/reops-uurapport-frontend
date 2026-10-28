"use client";
import { useState } from "react";
import { ArrowUndoIcon } from "@navikt/aksel-icons";
import { Button } from "@navikt/ds-react";
import { unarchiveReport } from "@src/services/reportServices";

interface RestoreReportButtonProps {
  reportId: string;
  /** Added to the accessible name so each row's button is distinguishable. */
  reportName: string;
  size?: "medium" | "small";
  onRestored: () => void;
  onError: () => void;
}

const RestoreReportButton = ({
  reportId,
  reportName,
  size = "medium",
  onRestored,
  onError,
}: RestoreReportButtonProps) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleClick = async () => {
    setIsSaving(true);
    try {
      await unarchiveReport(reportId);
      onRestored();
    } catch {
      onError();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Button
      variant="secondary"
      size={size}
      loading={isSaving}
      aria-label={`Gjenopprett ${reportName}`}
      icon={<ArrowUndoIcon aria-hidden />}
      onClick={handleClick}
    >
      Gjenopprett
    </Button>
  );
};

export default RestoreReportButton;
