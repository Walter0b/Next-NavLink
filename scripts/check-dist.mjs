// Sanity checks on the build output that publint / attw cannot do for us.
import { readFileSync } from 'node:fs';

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const errors = [];

// 1. Both builds must be Client Components, otherwise importing NavLink from a Server Component
//    (e.g. the root layout) breaks the Next.js build.
for (const file of ['dist/index.js', 'dist/index.mjs']) {
    if (!/^(["'])use client\1/.test(read(file).trimStart())) {
        errors.push(`${file} must start with the "use client" directive`);
    }
}

// 2. Next.js may load the ESM build with Node's native resolver, which needs file extensions:
//    `next/link` fails there while `next/link.js` works everywhere.
const esm = read('dist/index.mjs');
for (const [, specifier] of esm.matchAll(/(?:from|import)\s*["'](next\/[^"']+)["']/g)) {
    if (!specifier.endsWith('.js')) {
        errors.push(`dist/index.mjs imports "${specifier}" without a .js extension`);
    }
}

if (errors.length > 0) {
    console.error(errors.map((error) => `✖ ${error}`).join('\n'));
    process.exit(1);
}
console.log('✔ dist checks passed');
