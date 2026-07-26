import { describe, expect, it } from 'vitest';
import { TEST_RUNNER_PLACEHOLDER } from './config.js';

describe('test-runner/config (D1 placeholder)', () => {
  it('exports a stable placeholder identifier for D2 to replace', () => {
    expect(TEST_RUNNER_PLACEHOLDER).toBe('@ait-co/debugger/test-runner');
  });
});
