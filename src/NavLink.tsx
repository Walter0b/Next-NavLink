import React, { useMemo, ReactElement, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

/**
 * Props for the NavLink component.
 */
interface NavLinkProps {
    children: React.ReactNode | ((isActive: boolean) => React.ReactNode);
    activeClassName?: string;
    inActiveClassName?: string;
    className?: string;
    to: string;
    redirection?: boolean;
    id?: string;
    onClick?: () => void;
    matchMode?: 'exact' | 'includes' | 'startsWith';
    replace?: boolean;
    scroll?: boolean;
    prefetch?: boolean;
    isExternal?: boolean;
    aria?: { [key: string]: string };
    testId?: string;
    disabled?: boolean;
    activeStyle?: React.CSSProperties;
    inactiveStyle?: React.CSSProperties;
    customActiveUrl?: string;
}

/**
 * NavLink component for Next.js navigation with active state detection and external link support.
 *
 * @param {Object} props - Props for NavLink component.
 * @param {React.ReactNode | function} props.children - The content of the link. Can be a function that takes `isActive` boolean.
 * @param {string} [props.activeClassName='active'] - CSS class applied when the link is active.
 * @param {string} [props.inActiveClassName=''] - CSS class applied when the link is inactive.
 * @param {string} [props.className=''] - Additional CSS class applied to the link.
 * @param {string} props.to - The destination URL or path.
 * @param {boolean} [props.redirection=true] - Determines if redirection should occur on click.
 * @param {string} [props.id] - Unique identifier for the link element.
 * @param {function} [props.onClick] - Optional click event handler.
 * @param {'exact' | 'includes' | 'startsWith'} [props.matchMode='includes'] - The matching mode for active state detection.
 * @param {boolean} [props.replace=false] - Whether to replace the current history entry.
 * @param {boolean} [props.scroll=true] - Scrolls to the top of the page after navigation.
 * @param {boolean} [props.prefetch=true] - Prefetch the page in the background.
 * @param {boolean} [props.isExternal=false] - Marks the link as an external link.
 * @param {Object} [props.aria] - ARIA attributes for accessibility.
 * @param {string} [props.testId] - Data attribute for easier testing.
 * @param {boolean} [props.disabled=false] - Disables the link.
 * @param {React.CSSProperties} [props.activeStyle] - Inline styles applied when the link is active.
 * @param {React.CSSProperties} [props.inactiveStyle] - Inline styles applied when the link is inactive.
 * @param {string} [props.customActiveUrl] - Custom URL to match as active instead of the `to` prop.
 *
 * @returns {JSX.Element} The rendered NavLink component.
 */
const NavLink: React.FC<NavLinkProps> = React.memo(({
    to,
    redirection = true,
    id,
    children,
    inActiveClassName = '',
    className = '',
    activeClassName = 'active',
    onClick,
    matchMode = 'includes',
    replace = false,
    scroll = true,
    prefetch = true,
    isExternal = false,
    aria = {},
    testId,
    disabled = false,
    activeStyle,
    inactiveStyle,
    customActiveUrl,
}) => {
    const pathname = usePathname();
    const router = useRouter();

    const isActive = useMemo(() => {
        const urlToMatch = customActiveUrl || to;

        switch (matchMode) {
            case 'exact':
                return pathname === urlToMatch;
            case 'startsWith':
                return pathname.startsWith(urlToMatch);
            case 'includes':
            default:
                return pathname.includes(urlToMatch);
        }
    }, [pathname, to, matchMode, customActiveUrl]);

    const renderChildren = useMemo(() => {
        if (typeof children === 'function') {
            return children(isActive);
        }
        if (React.isValidElement(children)) {
            return React.cloneElement(children as ReactElement<{ isActive?: boolean }>, { isActive });
        }
        return children;
    }, [children, isActive]);

    const handleClick = useCallback((e: React.MouseEvent) => {
        if (disabled) {
            e.preventDefault();
            return;
        }
        if (onClick) {
            onClick();
        }
        if (!isExternal && redirection) {
            e.preventDefault();
            if (replace) {
                router.replace(to);
            } else {
                router.push(to);
            }
        }
    }, [disabled, onClick, isExternal, redirection, router, to, replace]);

    const commonProps = {
        id,
        className: `${className} ${isActive ? activeClassName : inActiveClassName} nav_links`.trim(),
        onClick: handleClick,
        style: isActive ? activeStyle : inactiveStyle,
        'data-testid': testId,
        'aria-disabled': disabled,
        ...aria,
    };

    if (!redirection || disabled) {
        return <span {...commonProps}>{renderChildren}</span>;
    }

    if (isExternal) {
        return (
            <a href={to} target="_blank" rel="noopener noreferrer" {...commonProps}>
                {renderChildren}
            </a>
        );
    }

    return (
        <Link
            href={to}
            replace={replace}
            scroll={scroll}
            prefetch={prefetch}
            {...commonProps}
        >
            {renderChildren}
        </Link>
    );
});

NavLink.displayName = 'NavLink';

export default NavLink;
