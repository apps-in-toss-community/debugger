#!/usr/bin/env node
/**
 * Guards the dependency edges the split exists to create.
 *
 * The security claim this repo makes is that "what can end up in a production
 * bundle?" is answerable by reading one package.json with one dependency in it.
 * That claim is only as good as the edges between the three packages, and the
 * ways it can break are all invisible to a bundle grep:
 *
 *   1. `@ait-co/debugger` declaring `@ait-co/debug-console` — eruda silently
 *      enters the daemon's install graph. Nothing in the daemon's own output
 *      changes, so `check-debug-surface-absent.sh` still passes. The regression
 *      is real and symptomless, which is exactly why it needs a mechanical
 *      check rather than review discipline.
 *   2. `@ait-co/debug-console` growing a dependency or any peer at all. Its
 *      whole contract is `eruda` and nothing else — a second entry, or a peer
 *      on the Toss SDK, and the one-file audit stops being true.
 *   3. `@ait-co/internal-protocol` appearing in a shipped package's runtime
 *      `dependencies` / `peerDependencies`. It is private and never published,
 *      so such an edge would resolve for us and 404 for consumers. It is a
 *      devDependency precisely so bundlers inline it at build time.
 *
 * Run: `node scripts/check-package-graph.mjs` (wired into `pnpm check:graph`
 * and CI). Exits non-zero with a named reason on the first violation.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const DEBUGGER = '@ait-co/debugger';
const DEBUG_CONSOLE = '@ait-co/debug-console';
const INTERNAL_PROTOCOL = '@ait-co/internal-protocol';

/** Reads a workspace package.json by directory name under `packages/`. */
function readPackage(dir) {
  const path = join(ROOT, 'packages', dir, 'package.json');
  return { path, json: JSON.parse(readFileSync(path, 'utf8')) };
}

const failures = [];

/** Records a violation; the script reports all of them, then exits 1. */
function fail(message) {
  failures.push(message);
}

const daemon = readPackage('debugger');
const console_ = readPackage('debug-console');

// --- 1. the daemon must not reach for the on-device console ---------------
for (const field of ['dependencies', 'peerDependencies', 'optionalDependencies']) {
  const deps = daemon.json[field] ?? {};
  if (DEBUG_CONSOLE in deps) {
    fail(
      `${DEBUGGER} declares ${DEBUG_CONSOLE} in "${field}". That pulls eruda into ` +
        `the daemon's install graph while every bundle check still passes — the ` +
        `silent regression this guard exists for. Remove the edge.`,
    );
  }
}

// --- 2. the on-device console ships eruda, alone, with no peers -----------
{
  const deps = console_.json.dependencies ?? {};
  const names = Object.keys(deps).sort();
  if (names.length !== 1 || names[0] !== 'eruda') {
    fail(
      `${DEBUG_CONSOLE} must depend on exactly ["eruda"], found ${JSON.stringify(names)}. ` +
        `This package is the only one that can enter a consumer's production bundle; ` +
        `its dependency list is the audit.`,
    );
  }
  for (const field of ['peerDependencies', 'peerDependenciesMeta', 'optionalDependencies']) {
    if (console_.json[field] !== undefined) {
      fail(
        `${DEBUG_CONSOLE} declares "${field}". It must have none: the Toss SDK is ` +
          `reached through a runtime probe (src/sdk-probe.ts), which is what keeps ` +
          `the package agnostic to the 2.x/3.x SDK line.`,
      );
    }
  }
}

// --- 3. the private protocol package never becomes a runtime edge --------
for (const pkg of [daemon, console_]) {
  for (const field of ['dependencies', 'peerDependencies', 'optionalDependencies']) {
    const deps = pkg.json[field] ?? {};
    if (INTERNAL_PROTOCOL in deps) {
      fail(
        `${pkg.json.name} declares ${INTERNAL_PROTOCOL} in "${field}". That package is ` +
          `private and never published, so the edge would 404 for consumers. It belongs ` +
          `in devDependencies, where the bundler inlines it at build time.`,
      );
    }
  }
  const devDeps = pkg.json.devDependencies ?? {};
  if (!(INTERNAL_PROTOCOL in devDeps)) {
    fail(
      `${pkg.json.name} does not list ${INTERNAL_PROTOCOL} in devDependencies. ` +
        `Both published packages consume the shared protocol source that way.`,
    );
  }
}

if (failures.length > 0) {
  for (const message of failures) process.stderr.write(`package-graph: ${message}\n`);
  process.exit(1);
}

process.stdout.write('package-graph: dependency edges OK\n');
