import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'jsdom',
        setupFiles: ['./vitest.setup.ts'],
        include: ['src/**/*.test.{ts,tsx}'],
        clearMocks: true,
        restoreMocks: true,
        // jsdom's first getComputedStyle / role query can take seconds on a busy CI runner.
        testTimeout: 20_000,
    },
});
