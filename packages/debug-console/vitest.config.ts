import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    restoreMocks: true,
    exclude: ['node_modules/**', 'dist/**'],
  },
});
