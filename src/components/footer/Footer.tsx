import { BodyLong, Heading } from "@navikt/ds-react";
import { Link } from "@/components/Link";
import styles from "./Footer.module.css";

function Footer() {
  return (
    <footer className={styles.footerContainer}>
      <div className={styles.contentGroups}>
        <div className={styles.contentGroup}>
          <Heading level="3" size="medium">
            Kontakt oss
          </Heading>
          <BodyLong>
            Har du spørsmål om universell utforming eller testing? Kontakt oss
            på e-post eller Slack.
          </BodyLong>
          <span className={styles.footerLinks}>
            <Link href="mailto:uu@nav.no">E-post</Link>
            <Link
              href="https://nav-it.slack.com/archives/C7MANSGLS"
              target="_blank"
            >
              Slack
            </Link>
          </span>
        </div>
        <div className={styles.contentGroup}>
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
        </div>
        <div className={styles.contentGroup}>
          <Heading level="3" size="medium">
            Nyttige resurser
          </Heading>
          <span className={styles.footerLinks}>
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
          </span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
