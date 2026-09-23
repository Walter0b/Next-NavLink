import Link from 'next/link.js';
import {
    forwardRef,
    type AnchorHTMLAttributes,
    type ComponentProps,
    type CSSProperties,
    type MouseEvent,
    type ReactNode,
    type Ref,
} from 'react';
import { isExternalUrl, isWebUrl, type MatchMode } from './match';
import { useIsActive } from './useIsActive';

/** Follows the installed Next.js version: `boolean | null` up to 14, plus `'auto'` from 15. */
type LinkPrefetch = ComponentProps<typeof Link>['prefetch'];

/**
 * Props for the NavLink component.
 *
 * Other `<a>` attributes (`title`, `target`, `data-*`, `aria-*`, event handlers...) are
 * forwarded. Anchor-only attributes are omitted when rendering a span.
 */
export interface NavLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'children' | 'onClick'> {
    /**
     * Destination: an internal path (`/about`) or an absolute URL (`https://example.com`).
     * Absolute URLs are treated as external links automatically.
     */
    to: string;
    /** Link content. Can be a function receiving the active state. */
    children: ReactNode | ((isActive: boolean) => ReactNode);
    /** Class applied when the link is active. @default 'active' */
    activeClassName?: string;
    /** Class applied when the link is not active. */
    inactiveClassName?: string;
    /** @deprecated Use `inactiveClassName`. */
    inActiveClassName?: string;
    /** Inline styles applied when the link is active (merged over `style`). */
    activeStyle?: CSSProperties;
    /** Inline styles applied when the link is not active (merged over `style`). */
    inactiveStyle?: CSSProperties;
    /** How the current pathname is compared with `to`. @default 'includes' */
    matchMode?: MatchMode;
    /** Match the current pathname against this URL instead of `to`. */
    customActiveUrl?: string;
    /** When `false`, renders a `<span>` and does not navigate. @default true */
    redirection?: boolean;
    /** Renders a non-interactive `<span aria-disabled="true">`; `onClick` is not called. @default false */
    disabled?: boolean;
    /**
     * Force (`true`) or prevent (`false`) external-link behavior: a plain `<a>` opening in a new tab
     * with `rel="noopener noreferrer"`. Detected from `to` when omitted.
     */
    isExternal?: boolean;
    /** Replace the current history entry instead of pushing a new one. */
    replace?: boolean;
    /** Scroll to the top of the page after navigation. Follows Next.js' default (`true`). */
    scroll?: boolean;
    /** Forwarded to `next/link`. Follows Next.js' default when omitted. */
    prefetch?: LinkPrefetch;
    /**
     * Click handler. Call `event.preventDefault()` to cancel the navigation.
     * Not called when `disabled`.
     */
    onClick?: (event: MouseEvent<HTMLElement>) => void;
    /** ARIA attributes, e.g. `{ 'aria-label': 'Home' }`. You can also pass `aria-*` props directly. */
    aria?: Record<string, string>;
    /** Sets `data-testid`. */
    testId?: string;
}

const mergeTokens = (...lists: (string | undefined)[]): string =>
    Array.from(new Set(lists.join(' ').split(/\s+/).filter(Boolean))).join(' ');

/**
 * `next/link` with active-state detection.
 *
 * Renders a `next/link` (or a plain `<a>` for external URLs, or a `<span>` when `disabled` /
 * `redirection={false}`), adds `activeClassName` / `activeStyle` when the current path matches
 * and sets `aria-current="page"` on the active link.
 *
 * The ref points to the rendered element: an `<a>` most of the time, a `<span>` when
 * disabled or `redirection={false}`.
 *
 * @example
 * <NavLink to="/blog" matchMode="startsWith" activeClassName="font-bold">Blog</NavLink>
 */
const NavLink = forwardRef<HTMLElement, NavLinkProps>(function NavLink(
    {
        to,
        children,
        className,
        style,
        id,
        onClick,
        activeClassName = 'active',
        inactiveClassName,
        inActiveClassName,
        activeStyle,
        inactiveStyle,
        matchMode,
        customActiveUrl,
        redirection = true,
        disabled = false,
        isExternal,
        replace,
        scroll,
        prefetch,
        aria,
        testId,
        target,
        rel,
        download,
        hrefLang,
        media,
        ping,
        referrerPolicy,
        type,
        ...rest
    },
    ref,
) {
    const isActive = useIsActive(to, { matchMode, customActiveUrl });
    const external = isExternal ?? isExternalUrl(to);

    const stateStyle = isActive ? activeStyle : inactiveStyle;

    const commonProps = {
        'aria-current': isActive ? ('page' as const) : undefined,
        ...aria,
        ...rest,
        ...(disabled && { 'aria-disabled': true as const, tabIndex: -1 }),
        id,
        // `nav_links` is a stable hook for global CSS, kept from 1.x.
        className: [className, isActive ? activeClassName : inactiveClassName ?? inActiveClassName, 'nav_links']
            .filter(Boolean)
            .join(' '),
        style: style || stateStyle ? { ...style, ...stateStyle } : undefined,
        onClick: (event: MouseEvent<HTMLElement>) => {
            if (disabled) {
                event.preventDefault();
                return;
            }
            onClick?.(event);
        },
        ...(testId !== undefined && { 'data-testid': testId }),
    };

    const content = typeof children === 'function' ? children(isActive) : children;

    if (!redirection || disabled) {
        return (
            <span ref={ref as Ref<HTMLSpanElement>} {...commonProps}>
                {content}
            </span>
        );
    }

    const anchorProps = { target, rel, download, hrefLang, media, ping, referrerPolicy, type };

    if (external) {
        const externalTarget = target ?? (isExternal === true || isWebUrl(to) ? '_blank' : undefined);
        const externalRel = externalTarget?.toLowerCase() === '_blank' ? mergeTokens('noopener noreferrer', rel) : rel;

        return (
            <a ref={ref as Ref<HTMLAnchorElement>} href={to} {...commonProps} {...anchorProps} target={externalTarget} rel={externalRel}>
                {content}
            </a>
        );
    }

    return (
        <Link
            ref={ref as Ref<HTMLAnchorElement>}
            href={to}
            replace={replace}
            scroll={scroll}
            prefetch={prefetch}
            {...commonProps}
            {...anchorProps}
        >
            {content}
        </Link>
    );
});

export default NavLink;
export { NavLink };
