import { describe, expect, it } from 'vitest';
import { MCP_SERVER_PLACEHOLDER } from './server.js';

describe('mcp/server (D1 placeholder)', () => {
  it('exports a stable placeholder identifier for D2 to replace', () => {
    expect(MCP_SERVER_PLACEHOLDER).toBe('@ait-co/debugger/mcp/server');
  });
});
