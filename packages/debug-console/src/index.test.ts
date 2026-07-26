import { describe, expect, it } from 'vitest';
import { DEBUG_CONSOLE_PLACEHOLDER } from './index.js';

describe('debug-console index (D1 placeholder)', () => {
  it('exports a stable placeholder identifier for D2 to replace', () => {
    expect(DEBUG_CONSOLE_PLACEHOLDER).toBe('@ait-co/debug-console');
  });
});
