/**
 * How the current pathname is compared with a link target.
 *
 * - `exact`: the pathname is the target (`/blog` matches `/blog` only).
 * - `startsWith`: the pathname is the target or nested under it
 *   (`/blog` matches `/blog` and `/blog/post`, but not `/blogger`).
 * - `includes`: the target appears anywhere in the pathname
 *   (`/blog` matches `/en/blog/post`).
 */
export type MatchMode = 'exact' | 'includes' | 'startsWith';

/** Any URL with a scheme (`https:`, `mailto:`, `tel:`...) or a protocol-relative one (`//cdn.example.com`). */
const ABSOLUTE_URL = /^(?:[a-z][a-z\d+.-]*:|\/\/)/i;

/** `http(s)://` or protocol-relative URLs, i.e. the ones that make sense to open in a new tab. */
const WEB_URL = /^(?:https?:)?\/\//i;

export const isExternalUrl = (url: string): boolean => ABSOLUTE_URL.test(url);

export const isWebUrl = (url: string): boolean => WEB_URL.test(url);

/** Drops the query string and hash, and any trailing slash (except for the root path). */
export const normalizePath = (path: string): string => {
    const end = path.search(/[?#]/);
    const clean = end === -1 ? path : path.slice(0, end);
    return clean.length > 1 ? clean.replace(/\/+$/, '') || '/' : clean;
};

/**
 * Tells whether `pathname` is "on" the link target `to`.
 *
 * Query strings, hashes and trailing slashes are ignored on both sides. The root
 * target (`/`) is only ever active on the root path itself, whatever the mode.
 * External targets and a missing pathname (Pages Router fallback pages) are never active.
 */
export const isPathActive = (
    pathname: string | null | undefined,
    to: string,
    matchMode: MatchMode = 'includes',
): boolean => {
    if (pathname == null || !to || isExternalUrl(to)) return false;

    const current = normalizePath(pathname);
    const target = normalizePath(to);

    if (!target) return false;
    if (target === '/') return current === '/';

    switch (matchMode) {
        case 'exact':
            return current === target;
        case 'startsWith':
            return current === target || current.startsWith(`${target}/`);
        case 'includes':
        default:
            return current.includes(target);
    }
};
