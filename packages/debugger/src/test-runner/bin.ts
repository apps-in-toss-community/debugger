/**
 * `debugger-test` bin entry point — export-free by design, mirroring
 * devtools' `src/test-runner/bin.ts` (see devtools issue #711): Rolldown
 * hoists an export-carrying module's body into a shared chunk and reduces
 * the bin file to a re-export wrapper, which silently defeats a self-invoke
 * guard evaluated inside that shared chunk. Staying export-free keeps the
 * `main()` call inlined directly into this compiled bin.
 *
 * Real implementation is vendored from devtools in D2 (frozen at
 * devtools#813, "SPLIT FREEZE").
 *
 * NOTE: no shebang in this source file — the tsdown entry's `banner` option
 * injects `#!/usr/bin/env node` into the compiled output.
 */
process.stdout.write(
  '[@ait-co/debugger] debugger-test placeholder — real implementation lands in D2.\n',
);
