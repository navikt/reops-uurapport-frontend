import { Heading, BodyLong, Link } from "@navikt/ds-react";
import styles from "./NotFound.module.css";

const NotFound = ({ resourceType = "side" }: { resourceType?: string }) => {
  return (
    <div className={styles.notFound}>
      <Heading size="xlarge" level="1">
        404 - Ikke funnet
      </Heading>
      <BodyLong>
        Beklager, denne resursen av type <code>{resourceType}</code> finnes
        ikke.
      </BodyLong>
      <Link href="/reports">Tilbake til rapporter</Link>
    </div>
  );
};

export default NotFound;
