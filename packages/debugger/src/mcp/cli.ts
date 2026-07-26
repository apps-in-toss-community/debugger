import { realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * Placeholder for the `debugger` bin entry (mode dispatch, CDP relay,
 * dashboard). Real implementation is vendored from `devtools`'s
 * `src/mcp/cli.ts` (frozen at devtools#813, "SPLIT FREEZE") in D2.
 *
 * Kept dual-purpose (importable export + bin), like the devtools original:
 * guarded by `isEntrypoint()` so importing this module for its exports never
 * triggers `main()` as a side effect.
 *
 * SECRET-HANDLING: only `http://127.0.0.1:<port>`-style local addresses are
 * safe to log here — never a relay `wss://` URL, tunnel hostname, TOTP
 * secret/code, or Deploy Key. See CLAUDE.md.
 */
export function main(): void {
  process.stdout.write(
    '[@ait-co/debugger] mcp/cli placeholder — real implementation lands in D2.\n',
  );
}

/**
 * True when this file is the process entry (the bin), not an import.
 *
 * Mirrors devtools `src/mcp/cli.ts`'s `isEntrypoint()`: under npx/npm's bin
 * shim, `argv[1]` is a symlink/wrapper path, not the realpath inside the
 * package, so a raw comparison against `import.meta.url` false-negatives on
 * the dominant install path. Resolve `argv[1]`'s realpath before comparing.
 */
function isEntrypoint(): boolean {
  const entry = process.argv[1];
  if (entry === undefined) return false;
  try {
    return fileURLToPath(import.meta.url) === realpathSync(entry);
  } catch {
    return false;
  }
}

if (isEntrypoint()) {
  main();
}
