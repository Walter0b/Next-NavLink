import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type MatchMode = 'exact' | 'includes' | 'startsWith';

interface NavLinkProps {
    children?: React.ReactNode | ((isActive: boolean) => React.ReactNode);
    activeClassName?: string;
    conditionalClassName?: string;
    className?: string;
    to: string;
    redirection?: boolean;
    id?: string;
    onClick?: () => void;
    matchMode?: MatchMode;
}

const NavLink: React.FC<NavLinkProps> = React.memo(({
    to,
    redirection = true,
    id,
    children,
    conditionalClassName = '',
    className,
    activeClassName = 'active',
    onClick,
    matchMode = 'includes',
}) => {
    const pathname = usePathname();

    const isActive = (() => {
        switch (matchMode) {
            case 'exact':
                return pathname === to;
            case 'startsWith':
                return pathname.startsWith(to);
            case 'includes':
            default:
                return pathname.includes(to);
        }
    })();

    const renderChildren = typeof children === 'function' ? children(isActive) : children;

    const commonProps = {
        id,
        className: `${className} ${isActive ? activeClassName : conditionalClassName} nav_links`,
        onClick: onClick,
    };

    if (!redirection) {
        return <span {...commonProps}>{renderChildren}</span>;
    }

    return <Link href={to} {...commonProps}>{renderChildren}</Link>;
});

NavLink.displayName = 'NavLink';

export default NavLink;
