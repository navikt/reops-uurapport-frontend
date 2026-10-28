import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// jsdom does not implement canvas; axe probes it and jsdom logs a noisy
// "Not implemented" error each time. Returning null is what axe expects.
HTMLCanvasElement.prototype.getContext = () => null;

// Cleanup after each test
afterEach(() => {
  cleanup();
});
