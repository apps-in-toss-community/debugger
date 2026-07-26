import { describe, expect, it } from 'vitest';
import { DEV_BRIDGE_PLACEHOLDER } from './index.js';

describe('dev-bridge (D1 placeholder)', () => {
  it('exports a stable placeholder identifier for D2 to replace', () => {
    expect(DEV_BRIDGE_PLACEHOLDER).toBe('@ait-co/debugger/dev-bridge');
  });
});
