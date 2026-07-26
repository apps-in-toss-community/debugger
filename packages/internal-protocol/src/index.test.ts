import { describe, expect, it } from 'vitest';
import { INTERNAL_PROTOCOL_PLACEHOLDER } from './index.js';

describe('internal-protocol index (D1 placeholder)', () => {
  it('exports a stable placeholder identifier for D2 to replace', () => {
    expect(INTERNAL_PROTOCOL_PLACEHOLDER).toBe('@ait-co/internal-protocol');
  });
});
