import { defineConfig, type Options } from 'tsdown';

// This package is devDependency / npx tooling only — every consumer runs on
// Node 24, so it ships ESM-only. (Contrast @ait-co/debug-console, which can
// land inside a consumer's app bundle and therefore ships dual ESM + CJS.)
//
// `package.json` exports/bin expect a `.js` extension, but tsdown's default
// ESM output extension is `.mjs` regardless of the package's own
// `"type": "module"` — override it explicitly (same fix as debug-console's
// tsdown.config.ts).
const outExtensions: Options['outExtensions'] = () => ({ js: '.js', dts: '.d.ts' });

const common = {
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'es2022',
  platform: 'node',
  format: ['esm'],
  outExtensions,
} as const;

// Each entry lives in its own config object, mirroring devtools'
// tsdown.config.ts (self-contained per-entry so Rolldown does not emit a
// shared hashed chunk at dist/ root for the single-file bins).
export default defineConfig([
  {
    ...common,
    entry: { 'mcp/server': 'src/mcp/server.ts' },
    // Banner is the single source of the shebang — src/mcp/server.ts must
    // not carry its own `#!/usr/bin/env node`, or the build emits a doubled
    // shebang and the file fails to parse.
    banner: { js: '#!/usr/bin/env node' },
  },
  {
    ...common,
    entry: { 'mcp/cli': 'src/mcp/cli.ts' },
    banner: { js: '#!/usr/bin/env node' },
  },
  {
    ...common,
    entry: { 'test-runner/config': 'src/test-runner/config.ts' },
  },
  {
    ...common,
    // Export-free bin entry — see src/test-runner/bin.ts for why it must
    // stay export-free (devtools issue #711: Rolldown shared-chunk hoisting
    // otherwise defeats the self-invoke guard silently).
    entry: { 'test-runner/bin': 'src/test-runner/bin.ts' },
    banner: { js: '#!/usr/bin/env node' },
  },
  {
    ...common,
    entry: { 'dev-bridge/index': 'src/dev-bridge/index.ts' },
  },
]);
