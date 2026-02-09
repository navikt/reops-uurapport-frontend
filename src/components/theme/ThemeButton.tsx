"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { ThemeIcon } from "@navikt/aksel-icons";
import { Button, Tooltip } from "@navikt/ds-react";

function ThemeButton() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

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
