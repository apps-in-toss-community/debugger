/**
 * Placeholder for the dev-bridge subpath — the local dev-mode connection
 * glue used by the MCP daemon's dev-mode path (mock-state server), as
 * distinct from the CDP/Chii relay to a real device. Real implementation is
 * vendored from devtools in D2 (frozen at devtools#813, "SPLIT FREEZE").
 */
export const DEV_BRIDGE_PLACEHOLDER = '@ait-co/debugger/dev-bridge' as const;
