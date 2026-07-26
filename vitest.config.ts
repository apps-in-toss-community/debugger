import { defineConfig } from 'vitest/config';

// Root-level Vitest Projects config so `pnpm test` runs every workspace
// package's suite from a single invocation (replacing the previous
// `pnpm -r test`). Each package keeps its own `vitest.config.ts` (jsdom vs.
// node environment, per-package `define`s) — the glob below just discovers
// and aggregates them; it does not change any package's individual settings.
export default defineConfig({
  test: {
    projects: ['packages/*'],
  },
});
