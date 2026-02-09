"use client";

import { useEffect, useState } from "react";
import { ThemeIcon } from "@navikt/aksel-icons";
import { Button, Tooltip } from "@navikt/ds-react";

function ThemeButton() {
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Check system preference and localStorage
    const storedTheme = localStorage.getItem("felgen-theme") as
      | "light"
      | "dark"
      | null;
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;

    const initialTheme = storedTheme || (prefersDark ? "dark" : "light");
    setResolvedTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  const applyTheme = (newTheme: "light" | "dark") => {
    const root = document.documentElement;
    const themeElement = document.querySelector(".aksel-theme");

    // Remove both classes first
    root.classList.remove("light", "dark");
    if (themeElement) {
      themeElement.classList.remove("light", "dark");
    }

    // Add the new theme class
    root.classList.add(newTheme);
    if (themeElement) {
      themeElement.classList.add(newTheme);
    }
  };

  const setTheme = (newTheme: "light" | "dark") => {
    setResolvedTheme(newTheme);
    localStorage.setItem("felgen-theme", newTheme);
    applyTheme(newTheme);
  };

  return (
    <Tooltip
      content={
        isMounted && resolvedTheme === "dark"
          ? "Endre til lyst tema"
          : "Endre til mørkt tema"
      }
    >
      <Button
        variant="tertiary"
        icon={<ThemeIcon aria-hidden />}
        onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
      />
    </Tooltip>
  );
}

export { ThemeButton };
