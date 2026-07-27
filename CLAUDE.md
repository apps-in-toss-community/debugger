# CLAUDE.md

This file is self-sufficient: everything a contributor needs to work in this repo lives here. It does not link to any private/internal repository — such links would 404 for outside contributors, which is worse than no link at all.

## Project character (tone rules)

`apps-in-toss-community` is a **community project** with no affiliation to Toss / Apps in Toss. In every user-facing artifact (README, UI copy, package descriptions, commit/PR messages, code comments, chat responses, etc.) never use words like "official", "provided by Toss", "made by Apps in Toss", "powered by Toss", or anything else implying partnership, sponsorship, or endorsement by Toss. Use natural alternatives instead — "community", "open-source". When in doubt, omit the claim entirely.

**Tone guide** (no defensive disclaimers): state the identity once, plainly, in the README footer — Korean `README.md`: `커뮤니티 오픈소스 프로젝트입니다.`, English `README.en.md`: `Community open-source project.`. Do not use defensive phrasing like "not affiliated" / "unofficial" / "비공식". Do not use a `>` blockquote box right after a header, ⚠️ icons, bold emphasis, or repeat the disclaimer more than once per file. Never mix Korean and English in the same document — i18n means separate files (`README.md` ko primary + `README.en.md` en sub), not bilingual sections. Both files are equal canonical documents: same section order, and a change to one updates the other in the same PR. Technical caveats ("not a blessed API", "may break") are not disclaimers — fold them into the relevant feature description instead.

Issues, proposals, and feature requests all go through GitHub Issues.

## Project overview

**`debugger`** is a pnpm workspace holding the remote-debugging half of what used to be a single, overgrown `@ait-co/devtools` package. `devtools` grew to cover 8 feature surfaces (mock SDK, browser dev env, phone preview, on-device debug, remote CDP, MCP server, test runner, in-app console) in one package. It is being split into **3 packages across 2 repos**:

| Package | Repo | Contents | Consumed as |
|---|---|---|---|
| `@ait-co/devtools` | `devtools` (unchanged) | mock · panel · unplugin | devDependency only, contributes nothing to app bundles |
| `@ait-co/debugger` | **this repo** | MCP daemon · CDP relay · test-runner · dev-bridge | devDependency / `npx` |
| `@ait-co/debug-console` | **this repo** | on-device attach · eruda console | **the only package that can enter an app bundle** |

The explicit motivation is a **security scope**: "what can end up in a production bundle?" should be answerable by reading one `package.json` with exactly one dependency (`eruda`). Splitting the on-device console (which *can* ship) from the MCP daemon / CDP relay / test-runner (which must *never* ship) makes that answer auditable at a glance instead of requiring a full dependency-graph review.

### Workspace layout

```
pnpm-workspace.yaml              packages: ['packages/*']
packages/debugger/               @ait-co/debugger      v0.1.0
                                  bins: debugger, debugger-test
                                  exports: /mcp/server /mcp/cli /test-runner /dev-bridge
                                  (deliberately no root "." export)
packages/debug-console/          @ait-co/debug-console v0.1.0
                                  no bins; exports: "." and "./auto"
                                  dependencies: eruda (and NOTHING else — no peerDependencies at all)
packages/internal-protocol/      private: true, never published
                                  device<->host shared source, no barrel index, "sideEffects": false
```

### Current status

The workspace scaffolding landed first (`pnpm-workspace.yaml`, per-package `package.json`/`tsconfig.json`/`tsdown.config.ts`/`vitest.config.ts`, CI, release workflow, Changesets config, docs), then the real source was vendored from `devtools`'s `src/mcp/`, `src/in-app/`, `src/test-runner/`, and part of `src/shared/` (see `devtools` issue #813, "SPLIT FREEZE", for the freeze boundary). The cross-package seams are resolved: `relay-auth-close`, the host-allowlist predicates, the bridge-observer snapshot shape, and the attach version handshake live in `internal-protocol`, and `parent-watcher` was copied into `packages/debugger/src/mcp/` — it is host-only in the sense that it does not belong in `internal-protocol` (it is `process.kill(pid, 0)`, not device↔host shared), but the daemon is the host and imports it, so it could not stay behind in `devtools`; that repo keeps its own copy for the unplugin tunnel path.

Invariant 1, 2, and 4 below are enforced mechanically by `pnpm check:graph` (`scripts/check-package-graph.mjs`), which runs in CI. The remaining bundle-shaped guards under `packages/debugger/scripts/` (react-free daemon output, debug-surface absence, test-runner dist) are vendored but not yet wired into the workflow — until they are, invariant 3 rests on review discipline.

## Invariants (the whole reason this repo is split the way it is)

1. **`@ait-co/debugger` must never declare `@ait-co/debug-console` as a dependency or an auto-installed peer.** If it did, `eruda` would enter the daemon's install graph and the "no debug surface in the daemon" invariant would break *while a bundle grep would still pass* — a silent, hard-to-notice regression. If the daemon ever needs to talk about the console package, it does so as documentation or an optional peer, never a hard edge.
2. **`@ait-co/debug-console` has zero peers.** It reaches the Toss SDK through a runtime probe (dynamic import / feature-sniff), never a static import, so it stays agnostic to `@apps-in-toss/web-framework` version (2.x vs 3.x) — a GA flip on the SDK side is a no-op for this package.
3. **The MCP daemon bundle must stay react-free.** Nothing under `packages/debugger` may pull in `react`/`react-dom` — that surface belongs to `devtools`'s panel, not the daemon.
4. **There are no required dependency edges between the three packages.** Everything cross-package is an optional peer, never a hard `dependencies`/`peerDependencies` (non-optional) entry. This applies to `internal-protocol` too even though it's private: it is consumed as raw TypeScript by the other two packages' bundlers (via a workspace `devDependency`, bundled/inlined at build time), never referenced in a shipped package's runtime `dependencies`.

## SECRET-HANDLING (this repo's defining constraint)

This repo is remote-debugging infrastructure, so it handles secrets. The following must **never** reach stdout, stderr, logs, gate-reason strings, commits, documentation, or PR bodies:

- TOTP secrets and generated codes
- relay `wss://` URLs, trycloudflare tunnel hostnames, `AIT_TUNNEL_BASE_URL`
- launcher deep-links carrying an `at=` parameter
- Deploy Keys (what the Toss console UI calls "API 키" / "API key" — the workspace-scope credential issued by `aitcc keys create` and consumed by `ait deploy --api-key`)

Only `http://127.0.0.1:<port>`-style local addresses are safe to log. Relay state files must be mode `0600` and gitignored (`.ait_relay`, `.ait_urls` — see `.gitignore`).

When in doubt, don't log it. A local loopback URL is the only thing in this domain that is unconditionally safe to print.

## Changesets: `fixed`, not `linked`

```json
"fixed": [["@ait-co/debugger", "@ait-co/debug-console"]]
```

The two published packages talk over a value-duplicated wire protocol with zero compile-time linkage between them, so a version number must always denote a mutually-tested pair. `fixed` manufactures a release for the unchanged member of the pair whenever the other one changes, guaranteeing they always carry the same version. `linked` only aligns packages that are *already* releasing in a given run — it does not force an unchanged member to release, which would let the pair drift (one at `0.2.0`, the other still at `0.1.3`, with no version-level signal that they were never tested together). `internal-protocol` is private and intentionally absent from this array — it never has its own release.

Both packages start at `0.1.0`. Single `latest` dist-tag — no beta channel, no `release-beta` job, no `snapshot` block. Versioning stays **patch-only** until the repo's first coordinated minor/major bump is explicitly decided — Claude may generate patch changesets autonomously but should ask before minor/major.

First publish is manual (npm's OIDC trusted-publishing flow cannot perform the *first* publish of a package that does not yet exist on the registry — npm/cli#8544). `release.yml` is ready to run once both packages exist on npm; getting them there the first time is a manual, one-time step.

## Toolchain

Node 24, **pnpm 11.17.0** (`packageManager` pinned in every `package.json`), TypeScript strict. **Biome** for lint + format (`suspicious.noExplicitAny: error`) — no ESLint, no Prettier. Standard scripts across the workspace: `lint`, `lint:fix`, `format`, `typecheck`, `build`, `test`. At the root, `build`/`typecheck`/`test` fan out to every package via `pnpm -r`; `lint`/`format` run Biome once across the whole workspace (Biome does not need a per-package invocation).

Pre-commit hook is source-controlled under `.githooks/` and activated per-clone via:

```sh
git config core.hooksPath .githooks
```

The hook body is a shared canonical artifact across `apps-in-toss-community` repos — copied verbatim, not "improved" locally. CI's `pnpm lint` is the actual enforcement layer; the hook is a fast local feedback mechanism.

## Naming

- npm packages: `@ait-co/debugger`, `@ait-co/debug-console` (private: `@ait-co/internal-protocol`) — the `@ait-co` scope is shared across the organization's published packages, independent of each package's repo name.
- Bins: `debugger` / `debugger-test` (from `@ait-co/debugger`). `@ait-co/debug-console` ships no bins.

## Commit style

Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`). Branch + PR — never push directly to `main`.
