/**
 * Late-attach "Debugger Connected" badge injection (issue #11).
 *
 * `start_attach` injected the on-phone badge only on the `!isError` branch of
 * its own attach-wait window. A phone scanned AFTER `wait_timeout_seconds`
 * elapsed still attaches (it shows up in `list_pages`), but the injection
 * branch was never reached again — so the badge stayed missing for the whole
 * session. These tests drive the real `DualConnectionRouter` attach watcher,
 * which detects attach independently of any tool call's wait window, plus the
 * `ensureDebugIndicator` helper's idempotence contract directly.
 *
 * No real relay / phone / browser — fakes only. The `AutoDevtoolsOpener` is
 * stubbed so the attach edge never spawns a browser.
 *
 * SECRET-HANDLING: no relay wss URL, tunnel host, or TOTP code appears in this
 * file. The badge expression itself is DOM label text only.
 */
import type { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { describe, expect, it, vi } from 'vitest';
import type {
  CdpCommandMap,
  CdpCommandName,
  CdpConnection,
  CdpEventMap,
  CdpEventName,
  CdpTarget,
} from '../cdp-connection.js';
import { type BootedFamily, DualConnectionRouter, ensureDebugIndicator } from '../debug-server.js';
import { AutoDevtoolsOpener } from '../devtools-opener.js';
import { InMemoryDiagnosticsCollector } from '../tools.js';

/** The badge element id the injected expression creates. */
const BADGE_ID = '__ait_debug_indicator';

// ---- Fakes -----------------------------------------------------------------

/**
 * Relay-kind connection fake with mutable targets that records every
 * `Runtime.evaluate` expression it is asked to run.
 */
class FakeRelayConn implements CdpConnection {
  readonly kind = 'relay' as const;

  /** Every expression passed to `Runtime.evaluate`, in order. */
  readonly evaluated: string[] = [];
  /** How many times `enableDomains()` was called. */
  enableDomainsCalls = 0;
  /** When true, `enableDomains()` rejects (page-level socket not open yet). */
  enableDomainsFails = false;

  private _targets: CdpTarget[] = [];

  setTargets(targets: CdpTarget[]): void {
    this._targets = targets;
  }

  enableDomains(): Promise<void> {
    this.enableDomainsCalls += 1;
    return this.enableDomainsFails
      ? Promise.reject(new Error('No mini-app page attached to the Chii relay yet.'))
      : Promise.resolve();
  }
  listTargets(): CdpTarget[] {
    return this._targets;
  }
  getBufferedEvents<E extends CdpEventName>(_e: E): ReadonlyArray<CdpEventMap[E]> {
    return [];
  }
  on(): () => void {
    return () => {};
  }
  send<M extends CdpCommandName>(
    method: M,
    params?: CdpCommandMap[M]['params'],
  ): Promise<CdpCommandMap[M]['result']> {
    if ((method as string) === 'Runtime.evaluate') {
      const expression = (params as { expression?: string } | undefined)?.expression ?? '';
      this.evaluated.push(expression);
      return Promise.resolve({
        result: { type: 'string', value: '' },
      } as CdpCommandMap[M]['result']);
    }
    return Promise.reject(new Error(`no canned result for ${String(method)}`));
  }

  /** Count of badge injections observed so far. */
  badgeInjections(): number {
    return this.evaluated.filter((e) => e.includes(BADGE_ID)).length;
  }
}

/** A page the phone would present after scanning the attach QR. */
function page(id: string): CdpTarget {
  return { id, title: 'mini-app', url: 'intoss-private://miniapp?_deploymentId=late-attach' };
}

/**
 * Builds a real `DualConnectionRouter` over a single lazily-resolved relay
 * family backed by `conn`, with the DevTools opener stubbed out and a fast
 * (10 ms) attach-watcher interval so the tests do not wait a full second.
 */
function makeRouter(conn: FakeRelayConn) {
  const devtoolsOpener = new AutoDevtoolsOpener();
  vi.spyOn(devtoolsOpener, 'open').mockImplementation(() => {});
  const family: BootedFamily = {
    connection: conn,
    stop() {},
    relayOrigin: 'intoss-webview',
    relayHttpUrl: 'http://127.0.0.1:9100',
  };
  const router = new DualConnectionRouter({
    bootLazyFor: () => Promise.resolve(family),
    diagnosticsCollector: new InMemoryDiagnosticsCollector(),
    devtoolsOpener,
    attachWatcherIntervalMs: 10,
  });
  // Minimal server stub — only sendToolListChanged is exercised.
  router.start({
    sendToolListChanged: vi.fn().mockResolvedValue(undefined),
  } as unknown as Server);
  return router;
}

// ---- Watcher-driven late attach (the #11 regression) ------------------------

describe('late attach — badge injection outside the start_attach wait window (#11)', () => {
  it('injects the badge when the page attaches after the wait window has closed', async () => {
    const conn = new FakeRelayConn();
    const router = makeRouter(conn);
    try {
      await router.switchMode('relay-staging');

      // State right after a `start_attach` that timed out: relay is up, the
      // watcher is armed, and nothing is attached yet.
      await new Promise((resolve) => setTimeout(resolve, 40));
      expect(conn.badgeInjections()).toBe(0);

      // The phone is scanned NOW — strictly after the wait window closed.
      conn.setTargets([page('late-1')]);

      await vi.waitFor(() => expect(conn.badgeInjections()).toBe(1));
      // The page-level CDP socket must be opened before Runtime.evaluate.
      expect(conn.enableDomainsCalls).toBeGreaterThan(0);
    } finally {
      router.stopWatcher();
    }
  });

  it('does not re-inject while the same page stays attached', async () => {
    const conn = new FakeRelayConn();
    const router = makeRouter(conn);
    try {
      await router.switchMode('relay-staging');
      conn.setTargets([page('late-1')]);
      await vi.waitFor(() => expect(conn.badgeInjections()).toBe(1));

      // Several more watcher ticks with an unchanged target signature.
      await new Promise((resolve) => setTimeout(resolve, 60));
      expect(conn.badgeInjections()).toBe(1);
    } finally {
      router.stopWatcher();
    }
  });

  it('re-injects when the attached page is replaced (rescan / reload)', async () => {
    const conn = new FakeRelayConn();
    const router = makeRouter(conn);
    try {
      await router.switchMode('relay-staging');
      conn.setTargets([page('late-1')]);
      await vi.waitFor(() => expect(conn.badgeInjections()).toBe(1));

      // A fresh deep-link produces a NEW target — that page carries no badge.
      conn.setTargets([page('late-2')]);
      await vi.waitFor(() => expect(conn.badgeInjections()).toBe(2));
    } finally {
      router.stopWatcher();
    }
  });
});

// ---- ensureDebugIndicator contract -----------------------------------------

describe('ensureDebugIndicator', () => {
  it('is a no-op when no page is attached', async () => {
    const conn = new FakeRelayConn();
    expect(await ensureDebugIndicator(conn)).toBe(false);
    expect(conn.evaluated).toHaveLength(0);
    expect(conn.enableDomainsCalls).toBe(0);
  });

  it('injects once per attached page and skips repeat calls', async () => {
    const conn = new FakeRelayConn();
    conn.setTargets([page('t1')]);

    expect(await ensureDebugIndicator(conn)).toBe(true);
    expect(conn.badgeInjections()).toBe(1);

    expect(await ensureDebugIndicator(conn)).toBe(false);
    expect(conn.badgeInjections()).toBe(1);

    // A replaced page is a different page — it needs its own badge.
    conn.setTargets([page('t2')]);
    expect(await ensureDebugIndicator(conn)).toBe(true);
    expect(conn.badgeInjections()).toBe(2);
  });

  // The memo release covers `enableDomains()` rejections ONLY, which is the
  // whole of what the helper's catch can see: `injectDebugIndicator` in
  // `test-runner/cell.ts` swallows its own `Runtime.evaluate` failure and
  // resolves normally, so an evaluate failure leaves the memo claimed and the
  // badge missing until the target is replaced. That gap is documented on
  // `ensureDebugIndicator` and is deliberately not covered here — asserting it
  // would only pin behaviour that lives in `cell.ts`.
  it('releases the memo when enableDomains() rejects so a later attach edge retries', async () => {
    const conn = new FakeRelayConn();
    conn.enableDomainsFails = true;
    conn.setTargets([page('t1')]);

    expect(await ensureDebugIndicator(conn)).toBe(false);
    expect(conn.badgeInjections()).toBe(0);

    // Same page, socket now available — the earlier rejection must not have
    // permanently claimed this target id.
    conn.enableDomainsFails = false;
    expect(await ensureDebugIndicator(conn)).toBe(true);
    expect(conn.badgeInjections()).toBe(1);
  });

  it('injects an expression carrying no relay URL or TOTP code', async () => {
    const conn = new FakeRelayConn();
    conn.setTargets([page('t1')]);
    await ensureDebugIndicator(conn);

    const expression = conn.evaluated[0] ?? '';
    expect(expression).toContain(BADGE_ID);
    expect(expression).not.toMatch(/wss:|trycloudflare|\bat=/);
  });
});
