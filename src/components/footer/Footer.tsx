import { BodyLong, Heading, Box, HGrid, VStack } from "@navikt/ds-react";
import { PageBlock } from "@/components/layout/PageBlock";
import { Link } from "@/components/Link";
import styles from "./Footer.module.css";

function Footer() {
  return (
    <Box as="footer" className={styles.footerContainer} paddingBlock="space-32">
      <PageBlock width="xl" gutters>
        <HGrid columns={{ xs: 1, md: 3 }} gap="space-32" align="start">
          <VStack gap="space-20" align="start">
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
          <VStack gap="space-20" align="start">
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
          <VStack gap="space-20" align="start">
            <Heading level="3" size="medium">
              Nyttige ressurser
            </Heading>
            <VStack gap="space-12" align="start">
              <Link
                href="https://aksel.nav.no/god-praksis/universell-utforming"
                target="_blank"
              >
                Universell utforming i Nav
              </Link>
              <Link
                href="https://chatgpt.com/g/g-KNxDmPfob-web-accessibility-expert"
                target="_blank"
              >
                Web Accessibility Expert (GPT av Morten Tollefsen)
              </Link>
            </VStack>
          </VStack>
        </HGrid>
      </PageBlock>
    </Box>
  );
}

export default Footer;
