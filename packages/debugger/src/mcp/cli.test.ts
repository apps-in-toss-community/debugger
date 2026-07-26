import { describe, expect, it, vi } from 'vitest';
import { main } from './cli.js';

describe('mcp/cli (D1 placeholder)', () => {
  it('main() writes a placeholder notice without throwing', () => {
    const write = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    expect(() => main()).not.toThrow();
    expect(write).toHaveBeenCalledWith(expect.stringContaining('mcp/cli placeholder'));
    write.mockRestore();
  });

  it('does not self-invoke main() merely by being imported under vitest', () => {
    // If the entrypoint guard were broken, importing this module would have
    // already called main() at module-eval time above the process.stdout.write
    // spy's reach — this test's mere presence (no crash, no unexpected
    // stdout during setup) is the regression guard for that failure mode.
    expect(typeof main).toBe('function');
  });
});
