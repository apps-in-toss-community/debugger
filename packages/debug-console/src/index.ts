/**
 * Placeholder for the on-device attach + eruda console entry.
 *
 * Real implementation is vendored from `devtools`'s `src/in-app/` (frozen at
 * devtools#813, "SPLIT FREEZE") in D2. This is the only package in the split
 * that can enter a production app bundle — its dependency graph must stay
 * exactly `{ eruda }` (see CLAUDE.md invariant 2: zero peerDependencies,
 * reaches the Toss SDK only through a runtime probe, never a static import).
 */
export const DEBUG_CONSOLE_PLACEHOLDER = '@ait-co/debug-console' as const;
