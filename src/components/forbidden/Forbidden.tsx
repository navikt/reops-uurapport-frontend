import { Heading, BodyLong } from "@navikt/ds-react";
import styles from "./Forbidden.module.css";

const Forbidden = () => {
  return (
    <div className={styles.forbidden}>
      <Heading size="xlarge" level="1">
        403 Forbidden
      </Heading>
      <BodyLong>Sorry, you are not allowed to access this page.</BodyLong>
    </div>
  );
};

export default Forbidden;
