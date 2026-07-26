import { defineConfig, type Options } from 'tsdown';

// This package is the only one in the split that can enter a consumer's
// production bundle (see CLAUDE.md invariants), so — like @ait-co/polyfill —
// it ships dual ESM + CJS so `require('@ait-co/debug-console/auto')` works
// under CommonJS bundlers/hosts too.
// `package.json` exports expect `.js` (ESM) and `.cjs` (CJS) extensions, so
// override tsdown's default `.mjs` / `.cjs` mapping under `"type": "module"`.
const outExtensions: Options['outExtensions'] = ({ format }) => {
  if (format === 'cjs') return { js: '.cjs', dts: '.d.cts' };
  return { js: '.js', dts: '.d.ts' };
};

const common = {
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'es2022',
  outExtensions,
} as const;

export default defineConfig([
  {
    ...common,
    entry: { index: 'src/index.ts' },
    format: ['esm', 'cjs'],
  },
  {
    ...common,
    // Side-effect entry: `import '@ait-co/debug-console/auto'` attaches the
    // on-device console without the consumer wiring `attach()` themselves.
    entry: { auto: 'src/auto.ts' },
    format: ['esm', 'cjs'],
  },
]);
