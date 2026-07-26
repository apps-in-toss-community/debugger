/**
 * Vendored from devtools' `e2e/launcher-cdp.test.ts`
 * (devtools@61aa2d0228df27c2c0ab2405726dd5301067981e, "SPLIT FREEZE"
 * devtools#813) — ONLY the relay half named in this repo's issue #2 mapping
 * table: the node-side relay lifecycle tests (`startChiiRelay`,
 * `ChiiCdpConnection`) and the pure `buildLauncherAttachUrl` URL-shape tests,
 * neither of which needs a browser page.
 *
 * NOT vendored: the `describe('launcher deep-link forwarding — env-2 CDP
 * params', ...)` block, which drives a Playwright `page` against the
 * launcher PWA fixture (`e2e/fixture/launcher/`) — that fixture is
 * `devtools.aitc.dev`-hosted and explicitly stays in devtools (this repo's
 * issue #2 "가져오지 말 것" list). See devtools' `e2e/launcher-cdp.test.ts` for
 * that block and its very detailed header comment on env-2 verifiability.
 *
 * Only the import path changed (`../src/mcp/...` →
 * `../packages/debugger/src/mcp/...`, reflecting this repo's layout); test
 * bodies are otherwise unmodified. This repo has no root-level e2e tooling
 * wired up yet (see run-tests-integration.test.ts's header note).
 */

import { expect, test } from '@playwright/test';
import { ChiiCdpConnection } from '../packages/debugger/src/mcp/chii-connection.js';
import { startChiiRelay } from '../packages/debugger/src/mcp/chii-relay.js';
import { buildLauncherAttachUrl } from '../packages/debugger/src/mcp/deeplink.js';

// ---------------------------------------------------------------------------
// Node-side relay lifecycle tests (no browser required)
// ---------------------------------------------------------------------------

test.describe('env-2 relay — node-side lifecycle', () => {
  test('startChiiRelay({port:0}) starts and /targets endpoint is reachable', async () => {
    const relay = await startChiiRelay({ port: 0 });
    try {
      expect(relay.port).toBeGreaterThan(0);
      expect(relay.baseUrl).toBe(`http://127.0.0.1:${relay.port}`);

      // The /targets HTTP endpoint must respond with a JSON body.
      const res = await fetch(`${relay.baseUrl}/targets`);
      expect(res.ok).toBe(true);
      const body: unknown = await res.json();
      // Chii returns { targets: [] } when no phone has attached.
      expect(body).toMatchObject({ targets: expect.any(Array) });
    } finally {
      await relay.close();
    }
  });

  test('ChiiCdpConnection.refreshTargets() returns empty list when no phone attached', async () => {
    // Start a local relay on a random port.
    const relay = await startChiiRelay({ port: 0 });
    try {
      const conn = new ChiiCdpConnection({ relayBaseUrl: relay.baseUrl });

      // refreshTargets() polls the relay's /targets endpoint. With no phone,
      // it should resolve to an empty array (not throw).
      const targets = await conn.refreshTargets();
      expect(Array.isArray(targets)).toBe(true);
      expect(targets).toHaveLength(0);

      // listTargets() is the synchronous cached view — also empty.
      expect(conn.listTargets()).toHaveLength(0);
    } finally {
      await relay.close();
    }
  });

  test('two relays on port:0 get distinct ports', async () => {
    const [a, b] = await Promise.all([startChiiRelay({ port: 0 }), startChiiRelay({ port: 0 })]);
    try {
      expect(a.port).toBeGreaterThan(0);
      expect(b.port).toBeGreaterThan(0);
      expect(a.port).not.toBe(b.port);
    } finally {
      await Promise.all([a.close(), b.close()]);
    }
  });
});

// ---------------------------------------------------------------------------
// buildLauncherAttachUrl shape tests (pure, no network)
// ---------------------------------------------------------------------------

test.describe('buildLauncherAttachUrl — URL shape', () => {
  const LAUNCHER_BASE = 'https://devtools.aitc.dev/launcher/';

  test('produces a valid launcher URL with url=, debug=1, relay= params', () => {
    const tunnelUrl = 'https://abc.trycloudflare.com';
    const wssUrl = 'wss://relay.trycloudflare.com';
    const out = buildLauncherAttachUrl(tunnelUrl, wssUrl);
    const parsed = new URL(out);

    expect(out.startsWith(LAUNCHER_BASE)).toBe(true);
    expect(parsed.searchParams.get('url')).toBe(tunnelUrl);
    expect(parsed.searchParams.get('debug')).toBe('1');
    expect(parsed.searchParams.get('relay')).toBe(wssUrl);
    expect(parsed.searchParams.has('at')).toBe(false);
  });

  test('appends at= only when totpCode is provided and non-empty', () => {
    const out = buildLauncherAttachUrl('https://t.example.com', 'wss://r.example.com', '123456');
    expect(new URL(out).searchParams.get('at')).toBe('123456');

    const outNoCode = buildLauncherAttachUrl('https://t.example.com', 'wss://r.example.com');
    expect(new URL(outNoCode).searchParams.has('at')).toBe(false);
  });
});
