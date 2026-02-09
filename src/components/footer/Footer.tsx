import { BodyLong, Heading, Box, HStack, VStack } from "@navikt/ds-react";
import { Link } from "@/components/Link";
import styles from "./Footer.module.css";

function Footer() {
  return (
    <Box
      as="footer"
      className={styles.footerContainer}
      paddingBlock="space-32"
      paddingInline="space-32"
    >
      <HStack gap="space-32" align="start" className={styles.contentGroups}>
        <VStack gap="space-20" align="start" style={{ minWidth: "30%" }}>
          <Heading level="3" size="medium">
            Kontakt oss
          </Heading>
          <BodyLong>
            Har du spørsmål om universell utforming eller testing? Kontakt oss
            på e-post eller Slack.
          </BodyLong>
          <VStack gap="space-12" align="start">
            <Link href="mailto:uu@nav.no">E-post</Link>
            <Link
              href="https://nav-it.slack.com/archives/C7MANSGLS"
              target="_blank"
            >
              Slack
            </Link>
          </VStack>
        </VStack>
        <VStack gap="space-20" align="start" style={{ minWidth: "30%" }}>
          <Heading level="3" size="medium">
            Har du tilbakemelding?
          </Heading>
          <BodyLong>
            Oppdager du feil eller har forslag til forbedringer? Legg inn en
            issue på GitHub.
          </BodyLong>
          <Link
            href="https://github.com/navikt/reops-uurapport-frontend"
            target="_blank"
          >
            GitHub
          </Link>
        </VStack>
        <VStack gap="space-20" align="start" style={{ minWidth: "30%" }}>
          <Heading level="3" size="medium">
            Nyttige resurser
          </Heading>
          <VStack gap="space-12" align="start">
            <Link
              href="https://aksel.nav.no/god-praksis/universell-utforming"
              target="_blank"
            >
              Universell utforming i NAV
            </Link>
            <Link
              href="https://chatgpt.com/g/g-KNxDmPfob-web-accessibility-expert"
              target="_blank"
            >
              Web Accessibility Expert (GPT av Morten Tollefsen)
            </Link>
          </VStack>
        </VStack>
      </HStack>
    </Box>
  );
}

export default Footer;
