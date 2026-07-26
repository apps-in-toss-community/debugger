/**
 * Placeholder for the MCP debugging daemon's server-construction entry.
 *
 * Real implementation is vendored from `devtools`'s `src/mcp/server.ts`
 * (frozen at devtools#813, "SPLIT FREEZE") in D2. Until then this module
 * exists only so the package's `./mcp/server` export and build pipeline
 * have somewhere to land.
 *
 * SECRET-HANDLING: nothing under src/mcp may log TOTP secrets, relay
 * `wss://` URLs, tunnel hostnames, or Deploy Keys — see CLAUDE.md.
 * Invariant: this daemon must stay react-free and must never depend on
 * `@ait-co/debug-console` (see CLAUDE.md invariants 1 and 3).
 */
export const MCP_SERVER_PLACEHOLDER = '@ait-co/debugger/mcp/server' as const;
