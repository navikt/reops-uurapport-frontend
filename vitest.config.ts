import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        ".next/",
        "out/",
        "vitest.config.ts",
        "vitest.setup.ts",
        "next.config.js",
        "next.config.analyze.js",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@language": path.resolve(__dirname, "./src/language"),
      "@img": path.resolve(__dirname, "./src/img"),
      "@layouts": path.resolve(__dirname, "./src/layouts"),
      "@src": path.resolve(__dirname, "./src"),
      "@language-redirecter": path.resolve(
        __dirname,
        "./src/components/language-redirecter",
      ),
    },
  },
});
