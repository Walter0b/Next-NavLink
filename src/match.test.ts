import { describe, expect, it } from 'vitest';
import { isExternalUrl, isPathActive, isWebUrl, normalizePath, type MatchMode } from './match';

describe('normalizePath', () => {
    it.each([
        ['/about', '/about'],
        ['/about/', '/about'],
        ['/about///', '/about'],
        ['/', '/'],
        ['/about?tab=1', '/about'],
        ['/about/?tab=1#top', '/about'],
        ['/about#team', '/about'],
        ['?tab=1', ''],
        ['#top', ''],
    ])('%s -> %s', (input, expected) => {
        expect(normalizePath(input)).toBe(expected);
    });
});

describe('isExternalUrl / isWebUrl', () => {
    it.each([
        ['https://example.com', true, true],
        ['http://example.com/a', true, true],
        ['HTTPS://EXAMPLE.COM', true, true],
        ['//cdn.example.com/a.js', true, true],
        ['mailto:hi@example.com', true, false],
        ['tel:+123456', true, false],
        ['/about', false, false],
        ['/about?redirect=https://example.com', false, false],
        ['about', false, false],
    ])('%s -> external: %s, web: %s', (url, external, web) => {
        expect(isExternalUrl(url)).toBe(external);
        expect(isWebUrl(url)).toBe(web);
    });
});

describe('isPathActive', () => {
    const cases: [MatchMode, string, string, boolean][] = [
        // exact
        ['exact', '/about', '/about', true],
        ['exact', '/about/', '/about', true],
        ['exact', '/about', '/about/', true],
        ['exact', '/about/us', '/about', false],
        ['exact', '/en/about', '/about', false],
        // startsWith: matches whole segments only
        ['startsWith', '/blog', '/blog', true],
        ['startsWith', '/blog/post-1', '/blog', true],
        ['startsWith', '/blog/post-1/comments', '/blog/post-1', true],
        ['startsWith', '/blogger', '/blog', false],
        ['startsWith', '/en/blog', '/blog', false],
        // includes: substring, the historical default
        ['includes', '/about', '/about', true],
        ['includes', '/about/us', '/about', true],
        ['includes', '/en/about/us', '/about', true],
        ['includes', '/contact', '/about', false],
    ];

    it.each(cases)('%s: %s vs %s -> %s', (mode, pathname, to, expected) => {
        expect(isPathActive(pathname, to, mode)).toBe(expected);
    });

    it('defaults to the includes mode', () => {
        expect(isPathActive('/en/about', '/about')).toBe(true);
    });

    it('only activates the root target on the root path, in every mode', () => {
        for (const mode of ['exact', 'startsWith', 'includes'] as const) {
            expect(isPathActive('/', '/', mode)).toBe(true);
            expect(isPathActive('/about', '/', mode)).toBe(false);
        }
    });

    it('ignores query strings and hashes on the target', () => {
        expect(isPathActive('/search', '/search?q=next', 'exact')).toBe(true);
        expect(isPathActive('/docs', '/docs#install', 'exact')).toBe(true);
    });

    it('is never active for external targets, empty targets or a missing pathname', () => {
        expect(isPathActive('/about', 'https://example.com/about')).toBe(false);
        expect(isPathActive('/about', 'mailto:hi@example.com')).toBe(false);
        expect(isPathActive('/about', '')).toBe(false);
        expect(isPathActive('/about', '#team')).toBe(false);
        expect(isPathActive(null, '/about')).toBe(false);
        expect(isPathActive(undefined, '/about')).toBe(false);
    });
});
