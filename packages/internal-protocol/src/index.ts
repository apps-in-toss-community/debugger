/**
 * Placeholder for the shared device<->host wire-protocol source.
 *
 * D2 vendors the real modules from devtools' `src/shared/` (frozen at
 * devtools#813, "SPLIT FREEZE" — `relay-auth-close` moves here;
 * `parent-watcher` stays in devtools as host-only). The eventual shape is
 * **not** a single barrel index — each protocol message type gets its own
 * module, imported by deep path from `@ait-co/debugger` and
 * `@ait-co/debug-console` (see CLAUDE.md "no barrel index"). This single
 * placeholder file exists only so D2 has somewhere to land; expect it to be
 * deleted / split apart once the real modules arrive.
 *
 * Never published — private workspace package, consumed as raw TypeScript
 * directly by sibling packages' bundlers (no build step of its own).
 */
export const INTERNAL_PROTOCOL_PLACEHOLDER = '@ait-co/internal-protocol' as const;
