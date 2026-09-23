import { fireEvent, render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation.js';
import { RouterContext } from 'next/dist/shared/lib/router-context.shared-runtime.js';
import type { NextRouter } from 'next/router.js';
import { createRef } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import NavLink, { type NavLinkProps } from './index';

// Same behavior checks as NavLink.test.tsx, but with the real `next/link` of the installed Next.js
// version. This is what the CI compatibility matrix (Next 13 -> 16) really exercises.
vi.mock('next/navigation.js', () => ({ usePathname: vi.fn() }));

beforeEach(() => {
    vi.mocked(usePathname).mockReturnValue('/');
});

describe('with the real next/link', () => {
    // Native next/link uses the Pages Router context outside Next.js' App Router bundler alias.
    const renderWithRouter = (props: Partial<NavLinkProps> = {}) => {
        const router: NextRouter = {
            route: '/', pathname: '/', asPath: '/', query: {}, basePath: '',
            isReady: true, isFallback: false, isPreview: false, isLocaleDomain: false,
            push: vi.fn().mockResolvedValue(true), replace: vi.fn().mockResolvedValue(true),
            prefetch: vi.fn().mockResolvedValue(undefined),
            back: vi.fn(), forward: vi.fn(), reload: vi.fn(), beforePopState: vi.fn(),
            events: { on: vi.fn(), off: vi.fn(), emit: vi.fn() },
        };
        render(
            <RouterContext.Provider value={router}>
                <NavLink to="/about" {...props}>About</NavLink>
            </RouterContext.Provider>,
        );
        return router;
    };

    it.each([
        { replace: false, scroll: true },
        { replace: false, scroll: false },
        { replace: true, scroll: true },
        { replace: true, scroll: false },
    ])('navigates once with %o', ({ replace, scroll }) => {
        const router = renderWithRouter({ replace, scroll });
        fireEvent.click(screen.getByText('About'));
        expect(router[replace ? 'replace' : 'push']).toHaveBeenCalledExactlyOnceWith(
            '/about', '/about', expect.objectContaining({ scroll }),
        );
        expect(router[replace ? 'push' : 'replace']).not.toHaveBeenCalled();
    });

    it('does not call the router when onClick cancels navigation', () => {
        const onClick = vi.fn((event) => event.preventDefault());
        const router = renderWithRouter({ onClick });
        fireEvent.click(screen.getByText('About'));
        expect(onClick).toHaveBeenCalledTimes(1);
        expect(router.push).not.toHaveBeenCalled();
        expect(router.replace).not.toHaveBeenCalled();
    });

    it.each(['metaKey', 'ctrlKey', 'shiftKey', 'altKey'])('leaves %s clicks to the browser', (key) => {
        const router = renderWithRouter();
        let preventedByLink: boolean | undefined;
        // Observe after React handles the click, then suppress jsdom's unsupported document navigation.
        document.addEventListener('click', (event) => {
            preventedByLink = event.defaultPrevented;
            event.preventDefault();
        }, { once: true });
        fireEvent.click(screen.getByText('About'), { [key]: true });
        expect(preventedByLink).toBe(false);
        expect(router.push).not.toHaveBeenCalled();
        expect(router.replace).not.toHaveBeenCalled();
    });

    it('renders an anchor with the right href, classes and aria-current', () => {
        vi.mocked(usePathname).mockReturnValue('/about');
        render(<NavLink to="/about" className="link">About</NavLink>);
        const link = screen.getByText('About');
        expect(link).toHaveAttribute('href', '/about');
        expect(link).toHaveAttribute('aria-current', 'page');
        expect(link.className).toBe('link active nav_links');
    });

    it('accepts replace, scroll and prefetch', () => {
        render(<NavLink to="/about" replace scroll={false} prefetch={false}>About</NavLink>);
        expect(screen.getByText('About')).toHaveAttribute('href', '/about');
    });

    it('forwards the ref to the anchor', () => {
        const ref = createRef<HTMLElement>();
        render(<NavLink to="/about" ref={ref}>About</NavLink>);
        expect(ref.current).toBe(screen.getByText('About'));
    });

    it('renders external links as plain anchors', () => {
        render(<NavLink to="https://example.com">Docs</NavLink>);
        const link = screen.getByText('Docs');
        expect(link).toHaveAttribute('href', 'https://example.com');
        expect(link).toHaveAttribute('target', '_blank');
    });
});
