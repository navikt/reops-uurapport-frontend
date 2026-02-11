import { LocalAlert, Button, Link, Box, VStack } from "@navikt/ds-react";
import { ValidationWarning } from "@/types";

const SLACK_CHANNEL_URL = "https://nav-it.slack.com/archives/C02UGFS2J4B";

interface ValidationWarningsProps {
  warnings: ValidationWarning[];
}

const getWarningMessage = (warning: ValidationWarning): string => {
  // Custom Norwegian message for team-related warnings
  if (
    warning.field === "team" ||
    warning.field.toLowerCase().includes("organizationunit")
  ) {
    return "Denne rapporten mangler et team. Kjenner du igjen denne rapporten? Ta kontakt med oss og del lenken med oss, samt hvem eller hvilket team som burde eie den.";
  }

  // Custom Norwegian message for author-related warnings
  if (warning.field === "author") {
    return "Denne rapporten mangler forfatterinformasjon. Hvis du vet hvem som opprettet denne rapporten, ta gjerne kontakt med oss.";
  }

  // Fallback to backend message
  return warning.message;
};

const getWarningTitle = (warning: ValidationWarning): string => {
  if (
    warning.field === "team" ||
    warning.field.toLowerCase().includes("organizationunit")
  ) {
    return "Mangler team";
  }

  if (warning.field === "author") {
    return "Mangler forfatter";
  }

  return "Advarsel";
};

export const ValidationWarnings = ({ warnings }: ValidationWarningsProps) => {
  if (!warnings || warnings.length === 0) {
    return null;
  }

  return (
    <VStack gap="space-4" paddingBlock="space-0 space-32">
      {warnings.map((warning, index) => (
        <LocalAlert key={`${warning.field}-${index}`} status={warning.severity}>
          <LocalAlert.Header>
            <LocalAlert.Title>{getWarningTitle(warning)}</LocalAlert.Title>
          </LocalAlert.Header>
          <LocalAlert.Content>
            {getWarningMessage(warning)}
            <Box paddingBlock="space-4 space-0" marginBlock="space-20 space-4">
              <Button
                as={Link}
                href={SLACK_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                variant="secondary"
                size="small"
                data-color="warning"
              >
                Gå til #researchops på Slack
              </Button>
            </Box>
          </LocalAlert.Content>
        </LocalAlert>
      ))}
    </VStack>
  );
};
