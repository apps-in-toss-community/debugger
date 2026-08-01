# debugger

[한국어](./README.md) · **English**

[![npm (@ait-co/debugger)](https://img.shields.io/npm/v/%40ait-co%2Fdebugger?label=%40ait-co%2Fdebugger)](https://www.npmjs.com/package/@ait-co/debugger)
[![npm (@ait-co/debug-console)](https://img.shields.io/npm/v/%40ait-co%2Fdebug-console?label=%40ait-co%2Fdebug-console)](https://www.npmjs.com/package/@ait-co/debug-console)
[![license](https://img.shields.io/badge/license-BSD--3--Clause-blue)](./LICENSE)

Remote-debugging infrastructure for Apps in Toss mini-apps — a pnpm workspace holding the MCP debugging daemon, on-device CDP relay, test runner, and on-device console.

This project is no longer maintained. The repo is being archived and becomes read-only, but the source and issue history stay on GitHub, and the published `@ait-co/debugger` · `@ait-co/debug-console` packages remain installable from npm — they just won't receive updates. The `aitc.dev` domain and the sites hosted on it are being retired, so read the documentation from the source files in the [`docs`](https://github.com/apps-in-toss-community/docs) repo. The launcher PWA used for real-device attach lives on that same domain (`devtools.aitc.dev/launcher/`) and goes away with it — the attach deep-link `@ait-co/debugger` builds points at that host, so this path stops working once the domain is gone. There is no replacement host, so the constant is left as-is.

`@ait-co/devtools` grew to hold 8 feature surfaces (mock · panel · unplugin · phone preview · on-device debug · remote CDP · MCP server · test runner · in-app console) in a single package. It has been split into **3 packages across 2 repos**, and this repo carries the debug/observability half. The explicit motivation for the split is a **security scope**: "what can end up in a production bundle?" should be answerable by reading one `package.json` with exactly one dependency (`eruda`).

| Package | Repo | Contents | Consumed as |
|---|---|---|---|
| `@ait-co/devtools` | [`devtools`](https://github.com/apps-in-toss-community/devtools) | mock · panel · unplugin | devDependency only, contributes nothing to app bundles |
| `@ait-co/debugger` | here | MCP daemon · CDP relay · test-runner · dev-bridge | devDependency / `npx` |
| `@ait-co/debug-console` | here | on-device attach · eruda console | **the only package that can enter an app bundle** |

The split is done — the MCP daemon, CDP relay, test runner, and on-device console implementations all live in this workspace, and both packages ship on npm. `@ait-co/devtools` handed over its debug surface in 0.2.0 and now holds only mock, panel, and unplugin.

## Install

```sh
pnpm add -D @ait-co/debugger        # MCP daemon · CDP relay · test-runner · dev-bridge
pnpm add @ait-co/debug-console      # on-device attach + eruda console (the only package safe to ship)
```

You can also run it directly via `npx` without installing. The package name and the bin name differ, so call it in `-p` form:

```sh
npx -p @ait-co/debugger debugger
```

## Layout

```
packages/
  debugger/            @ait-co/debugger      — bins: debugger, debugger-test
  debug-console/        @ait-co/debug-console — exports: . and ./auto (no bins)
  internal-protocol/    private, never published — device<->host protocol source shared by both packages
```

For per-package usage, exports, and security scope, see [`packages/debugger/README.en.md`](./packages/debugger/README.en.md) · [`packages/debug-console/README.en.md`](./packages/debug-console/README.en.md).

There are **zero required dependency edges** between the three packages — any cross-package reference is always declared as an optional peer. See [`CLAUDE.md`](./CLAUDE.md) for the full invariants and secret-handling rules.

Ten issues moved here from `devtools` during the split and were renumbered; the mapping lives in [`docs/issue-transfer-map.md`](./docs/issue-transfer-map.md) (written in Korean) — look there when you hit an old `devtools#N` reference.

## Development

```sh
pnpm install
pnpm build
pnpm typecheck
pnpm test
pnpm lint
```

This is a pnpm workspace, so `build`/`typecheck`/`test` fan out to every package via `pnpm -r`, while `lint`/`format` run Biome across the whole workspace in one pass.

### Pre-commit hook

Optional but recommended. After cloning, activate the standard pre-commit hook (runs `biome check` on staged files):

```sh
git config core.hooksPath .githooks
```

This is a developer convenience for fast feedback before push. CI runs the same checks as the enforcement layer, so contributors who don't activate the hook will still see lint failures in their PR.

## Release

Both published packages move together via a Changesets `fixed` pair (`@ait-co/debugger` · `@ait-co/debug-console`) — the two packages talk over a value-duplicated wire protocol with zero compile-time linkage, so guaranteeing "version X = a mutually-tested pair" requires `fixed`, not `linked`. `internal-protocol` is private and is not part of this pair.

## License

BSD-3-Clause

---

Community open-source project.
