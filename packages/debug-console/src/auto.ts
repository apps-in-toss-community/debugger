/**
 * Side-effect entry: `import '@ait-co/debug-console/auto'` attaches the
 * on-device console automatically. Placeholder until D2 vendors the real
 * gate/attach logic from devtools' `src/in-app/auto.ts` (frozen at
 * devtools#813, "SPLIT FREEZE").
 */
import { DEBUG_CONSOLE_PLACEHOLDER } from './index.js';

// Referenced so this module has an observable side effect even as a
// placeholder — an empty side-effect file would make it impossible to test
// that the `/auto` entry actually wires through on import.
(globalThis as Record<string, unknown>).__AIT_DEBUG_CONSOLE_PLACEHOLDER__ =
  DEBUG_CONSOLE_PLACEHOLDER;
