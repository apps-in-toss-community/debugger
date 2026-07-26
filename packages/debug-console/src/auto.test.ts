import { describe, expect, it } from 'vitest';

describe('debug-console auto (D1 placeholder)', () => {
  it('importing the side-effect entry sets the placeholder sentinel', async () => {
    await import('./auto.js');
    expect((globalThis as Record<string, unknown>).__AIT_DEBUG_CONSOLE_PLACEHOLDER__).toBe(
      '@ait-co/debug-console',
    );
  });
});
