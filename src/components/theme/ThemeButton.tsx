"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { ThemeIcon } from "@navikt/aksel-icons";
import { Button, Tooltip } from "@navikt/ds-react";

const emptySubscribe = () => () => {};

// Only true once the client has hydrated. Avoids SSR/client hydration
// mismatch without calling setState from an effect.
function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

function ThemeButton() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useIsClient();

  const toggleTheme = () => {
    setTheme(resolvedTheme === "light" ? "dark" : "light");
  };

  // Prevent hydration mismatch by rendering nothing during SSR
  if (!mounted) {
    return null;
  }

  return (
    <Tooltip
      content={
        resolvedTheme === "dark"
          ? "Endre til lyst tema"
          : "Endre til mørkt tema"
      }
    >
      <Button
        variant="tertiary"
        icon={<ThemeIcon aria-hidden />}
        onClick={toggleTheme}
      />
    </Tooltip>
  );
}

export { ThemeButton };
