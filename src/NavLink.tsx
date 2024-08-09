import React, { useMemo, ReactElement, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';


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