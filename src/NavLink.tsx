import React, { useMemo, ReactElement, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

type MatchMode = 'exact' | 'includes' | 'startsWith';

interface NavLinkProps {
    children: React.ReactNode | ((isActive: boolean) => React.ReactNode);
    activeClassName?: string;
    conditionalClassName?: string;
    className?: string;
    to: string;
    redirection?: boolean;
    id?: string;
    onClick?: () => void;
    matchMode?: MatchMode;
    replace?: boolean;
    scroll?: boolean;
    prefetch?: boolean;
    isExternal?: boolean;
    aria?: { [key: string]: string };
    testId?: string;
    disabled?: boolean;
    activeStyle?: React.CSSProperties;
    inactiveStyle?: React.CSSProperties;
}

const NavLink: React.FC<NavLinkProps> = React.memo(({
    to,
    redirection = true,
    id,
    children,
    conditionalClassName = '',
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
}) => {
    const pathname = usePathname();
    const router = useRouter();

    const isActive = useMemo(() => {
        switch (matchMode) {
            case 'exact':
                return pathname === to;
            case 'startsWith':
                return pathname.startsWith(to);
            case 'includes':
            default:
                return pathname.includes(to);
        }
    }, [pathname, to, matchMode]);

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
        className: `${className} ${isActive ? activeClassName : conditionalClassName} nav_links`.trim(),
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