import { usePathname } from 'next/navigation.js';
import { isPathActive, type MatchMode } from './match';

export interface UseIsActiveOptions {
    /** How the pathname is compared with `to`. @default 'includes' */
    matchMode?: MatchMode;
    /** Match against this URL instead of `to`. */
    customActiveUrl?: string;
}

/**
 * Returns whether the current pathname matches `to`, using the same rules as `<NavLink>`.
 * Handy to style something next to a link (an icon, a parent menu...).
 *
 * @example
 * const isActive = useIsActive('/blog', { matchMode: 'startsWith' });
 */
export function useIsActive(to: string, { matchMode = 'includes', customActiveUrl }: UseIsActiveOptions = {}): boolean {
    return isPathActive(usePathname(), customActiveUrl || to, matchMode);
}
