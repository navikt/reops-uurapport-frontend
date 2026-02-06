"use client";

import { MoonIcon, SunIcon } from "@navikt/aksel-icons";
import { Button, Tooltip } from "@navikt/ds-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Required for hydration check
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render placeholder with same dimensions to prevent layout shift
    return (
      <Button variant="tertiary" size="small" style={{ opacity: 0 }}>
        <SunIcon aria-hidden />
        Tema
      </Button>
    );
  }

  const isDark = theme === "dark";

  return (
    <Tooltip
      content={
        mounted && theme === "dark"
          ? "Endre til lyst tema"
          : "Endre til mørkt tema"
      }
    >
      <Button
        variant="tertiary"
        size="small"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        icon={isDark ? <SunIcon aria-hidden /> : <MoonIcon aria-hidden />}
        aria-label={isDark ? "Bytt til lyst tema" : "Bytt til mørkt tema"}
      ></Button>
    </Tooltip>
  );
}
