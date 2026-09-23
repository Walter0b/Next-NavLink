import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
    target: 'es2019',
    // The component uses hooks and event handlers, so it must always be a Client Component.
    // Set here (not in the source) because esbuild drops module-level directives while bundling.
    banner: { js: '"use client";' },
});
