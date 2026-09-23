import { fireEvent, render, renderHook, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation.js';
import { createRef } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import NavLink, { NavLink as NamedNavLink, useIsActive, type NavLinkProps } from './index';

vi.mock('next/navigation.js', () => ({ usePathname: vi.fn() }));

// A transparent stand-in for next/link: an <a> that exposes the Link-only props as data attributes.
vi.mock('next/link.js', async () => {
    const { createElement, forwardRef } = await import('react');
    const MockLink = forwardRef<HTMLAnchorElement, Record<string, unknown>>(function MockLink(
        { replace, scroll, prefetch, ...props },
        ref,
    ) {
        return createElement('a', {
            ref,
            'data-next-link': '',
            'data-replace': String(replace),
            'data-scroll': String(scroll),
            'data-prefetch': String(prefetch),
            ...props,
        });
    });
    return { default: MockLink };
});

const setPathname = (pathname: string | null) => vi.mocked(usePathname).mockReturnValue(pathname as string);

const isNextLink = (element: HTMLElement) => element.hasAttribute('data-next-link');

beforeEach(() => setPathname('/'));

describe('exports', () => {
    it('exposes NavLink as both the default and a named export', () => {
        expect(NamedNavLink).toBe(NavLink);
    });
});

describe('active state', () => {
    it('renders a link to `to` through next/link', () => {
        render(<NavLink to="/about">About</NavLink>);
        const link = screen.getByText('About');
        expect(link.tagName).toBe('A');
        expect(link).toHaveAttribute('href', '/about');
        expect(isNextLink(link)).toBe(true);
    });

    it('adds the active class (default: "active") when the path matches', () => {
        setPathname('/about');
        render(<NavLink to="/about">About</NavLink>);
        expect(screen.getByText('About')).toHaveClass('active', 'nav_links');
    });

    it('supports a custom active class', () => {
        setPathname('/about');
        render(<NavLink to="/about" activeClassName="is-current">About</NavLink>);
        expect(screen.getByText('About')).toHaveClass('is-current');
        expect(screen.getByText('About')).not.toHaveClass('active');
    });

    it('adds the inactive class when the path does not match', () => {
        render(<NavLink to="/about" inactiveClassName="idle">About</NavLink>);
        expect(screen.getByText('About')).toHaveClass('idle', 'nav_links');
        expect(screen.getByText('About')).not.toHaveClass('active');
    });

    it('still supports the deprecated `inActiveClassName`', () => {
        render(<NavLink to="/about" inActiveClassName="idle">About</NavLink>);
        expect(screen.getByText('About')).toHaveClass('idle');
    });

    it('builds a clean class list: className, state class, then nav_links', () => {
        setPathname('/about');
        render(<NavLink to="/about" className="custom">About</NavLink>);
        expect(screen.getByText('About').className).toBe('custom active nav_links');
    });

    it('does not leave stray whitespace when classes are empty', () => {
        render(<NavLink to="/about">About</NavLink>);
        expect(screen.getByText('About').className).toBe('nav_links');
    });

    it('sets aria-current="page" on the active link only', () => {
        setPathname('/about');
        render(
            <>
                <NavLink to="/about">About</NavLink>
                <NavLink to="/contact">Contact</NavLink>
            </>,
        );
        expect(screen.getByText('About')).toHaveAttribute('aria-current', 'page');
        expect(screen.getByText('Contact')).not.toHaveAttribute('aria-current');
    });

    it('lets the caller override aria-current', () => {
        setPathname('/about');
        render(<NavLink to="/about" aria-current="location">About</NavLink>);
        expect(screen.getByText('About')).toHaveAttribute('aria-current', 'location');
    });

    it('applies activeStyle / inactiveStyle on top of style', () => {
        // Reads element.style directly: toHaveStyle() goes through getComputedStyle, which is very slow in jsdom.
        // A factory, not a shared element: rerender() with the same element object would be a no-op.
        const ui = () => (
            <NavLink to="/about" style={{ color: 'black', margin: 4 }} activeStyle={{ color: 'red' }} inactiveStyle={{ color: 'blue' }}>
                About
            </NavLink>
        );
        const { rerender } = render(ui());
        expect(screen.getByText('About').style.color).toBe('blue');
        expect(screen.getByText('About').style.margin).toBe('4px');

        setPathname('/about');
        rerender(ui());
        expect(screen.getByText('About').style.color).toBe('red');
        expect(screen.getByText('About').style.margin).toBe('4px');
    });

    it('accepts a function as children and gives it the active state', () => {
        const { rerender } = render(<NavLink to="/about">{(isActive) => (isActive ? 'Active' : 'Inactive')}</NavLink>);
        expect(screen.getByText('Inactive')).toBeInTheDocument();

        setPathname('/about');
        rerender(<NavLink to="/about">{(isActive) => (isActive ? 'Active' : 'Inactive')}</NavLink>);
        expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('does not inject props into element children (React would warn on DOM elements)', () => {
        const error = vi.spyOn(console, 'error').mockImplementation(() => {});
        render(
            <NavLink to="/about">
                <span data-testid="child">About</span>
            </NavLink>,
        );
        expect(screen.getByTestId('child').outerHTML).toBe('<span data-testid="child">About</span>');
        expect(error).not.toHaveBeenCalled();
    });

    it('is inactive, and does not crash, when the pathname is not available', () => {
        setPathname(null);
        render(<NavLink to="/about">About</NavLink>);
        expect(screen.getByText('About')).not.toHaveClass('active');
    });
});

describe('matching', () => {
    const activeAt = (pathname: string, props: Partial<NavLinkProps>) => {
        setPathname(pathname);
        const { unmount } = render(<NavLink to="/about" {...props}>Link</NavLink>);
        const isActive = screen.getByText('Link').classList.contains('active');
        unmount();
        return isActive;
    };

    it('defaults to "includes"', () => {
        expect(activeAt('/en/about/team', {})).toBe(true);
    });

    it('supports "exact"', () => {
        expect(activeAt('/about', { matchMode: 'exact' })).toBe(true);
        expect(activeAt('/about/team', { matchMode: 'exact' })).toBe(false);
    });

    it('supports "startsWith" on whole segments', () => {
        expect(activeAt('/about/team', { matchMode: 'startsWith' })).toBe(true);
        expect(activeAt('/aboutus', { matchMode: 'startsWith' })).toBe(false);
    });

    it('matches `customActiveUrl` instead of `to`', () => {
        expect(activeAt('/profile', { to: '/profile/edit', customActiveUrl: '/profile' })).toBe(true);
        expect(activeAt('/profile/edit', { to: '/profile/edit', customActiveUrl: '/settings' })).toBe(false);
    });

    it('activates a link to "/" on the home page only', () => {
        setPathname('/about');
        const { unmount } = render(<NavLink to="/">Home</NavLink>);
        expect(screen.getByText('Home')).not.toHaveClass('active');
        unmount();

        setPathname('/');
        render(<NavLink to="/">Home</NavLink>);
        expect(screen.getByText('Home')).toHaveClass('active');
    });

    it('ignores the query string and hash of `to`', () => {
        expect(activeAt('/search', { to: '/search?q=next#results', matchMode: 'exact' })).toBe(true);
    });
});

describe('navigation', () => {
    it('forwards replace, scroll and prefetch to next/link', () => {
        render(<NavLink to="/about" replace scroll={false} prefetch={false}>About</NavLink>);
        const link = screen.getByText('About');
        expect(link).toHaveAttribute('data-replace', 'true');
        expect(link).toHaveAttribute('data-scroll', 'false');
        expect(link).toHaveAttribute('data-prefetch', 'false');
    });

    it('leaves replace, scroll and prefetch to next/link defaults when omitted', () => {
        render(<NavLink to="/about">About</NavLink>);
        const link = screen.getByText('About');
        expect(link).toHaveAttribute('data-replace', 'undefined');
        expect(link).toHaveAttribute('data-scroll', 'undefined');
        expect(link).toHaveAttribute('data-prefetch', 'undefined');
    });

    it('calls onClick with the event', () => {
        const onClick = vi.fn((event) => event.preventDefault());
        render(<NavLink to="/about" onClick={onClick}>About</NavLink>);
        fireEvent.click(screen.getByText('About'));
        expect(onClick).toHaveBeenCalledTimes(1);
        expect(onClick.mock.calls[0][0]).toMatchObject({ type: 'click' });
    });

    it('lets onClick cancel the navigation with preventDefault', () => {
        render(<NavLink to="/about" onClick={(event) => event.preventDefault()}>About</NavLink>);
        expect(fireEvent.click(screen.getByText('About'))).toBe(false);
    });
});

describe('disabled and redirection={false}', () => {
    it('keeps disabled links out of the tab order and announces their actual state', () => {
        render(
            <NavLink to="/about" disabled tabIndex={0} aria={{ 'aria-disabled': 'false' }} aria-disabled={false}>
                About
            </NavLink>,
        );
        const element = screen.getByText('About');
        expect(element).toHaveAttribute('aria-disabled', 'true');
        expect(element.tabIndex).toBe(-1);
    });

    it.each([{ disabled: true }, { redirection: false }])('omits anchor-only attributes on spans: %o', (props) => {
        render(
            <NavLink to="/about" {...props} target="_blank" rel="nofollow" download="about.html"
                hrefLang="en" media="print" ping="/track" referrerPolicy="no-referrer" type="text/html">
                About
            </NavLink>,
        );
        const element = screen.getByText('About');
        for (const attribute of ['target', 'rel', 'download', 'hreflang', 'media', 'ping', 'referrerpolicy', 'type']) {
            expect(element).not.toHaveAttribute(attribute);
        }
    });

    it('renders an inert span when disabled', () => {
        const onClick = vi.fn();
        render(<NavLink to="/about" disabled onClick={onClick}>About</NavLink>);
        const element = screen.getByText('About');
        expect(element.tagName).toBe('SPAN');
        expect(element).toHaveAttribute('aria-disabled', 'true');
        expect(element).not.toHaveAttribute('href');
        fireEvent.click(element);
        expect(onClick).not.toHaveBeenCalled();
    });

    it('does not set aria-disabled on enabled links', () => {
        render(<NavLink to="/about">About</NavLink>);
        expect(screen.getByText('About')).not.toHaveAttribute('aria-disabled');
    });

    it('renders a span that still calls onClick when redirection is false', () => {
        const onClick = vi.fn();
        render(<NavLink to="/about" redirection={false} onClick={onClick}>About</NavLink>);
        const element = screen.getByText('About');
        expect(element.tagName).toBe('SPAN');
        fireEvent.click(element);
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('keeps the active state on a span', () => {
        setPathname('/about');
        render(<NavLink to="/about" redirection={false}>About</NavLink>);
        expect(screen.getByText('About')).toHaveClass('active');
    });
});

describe('external links', () => {
    it.each([['https://example.com/docs'], ['http://example.com'], ['//cdn.example.com/file']])(
        'opens %s in a new tab with a plain anchor',
        (to) => {
            render(<NavLink to={to}>Docs</NavLink>);
            const link = screen.getByText('Docs');
            expect(isNextLink(link)).toBe(false);
            expect(link).toHaveAttribute('href', to);
            expect(link).toHaveAttribute('target', '_blank');
            expect(link).toHaveAttribute('rel', 'noopener noreferrer');
        },
    );

    it('renders mailto: and tel: as plain anchors without target', () => {
        render(<NavLink to="mailto:hi@example.com">Mail</NavLink>);
        const link = screen.getByText('Mail');
        expect(isNextLink(link)).toBe(false);
        expect(link).toHaveAttribute('href', 'mailto:hi@example.com');
        expect(link).not.toHaveAttribute('target');
        expect(link).not.toHaveAttribute('rel');
    });

    it('honors isExternal on a relative path', () => {
        render(<NavLink to="/docs" isExternal>Docs</NavLink>);
        const link = screen.getByText('Docs');
        expect(isNextLink(link)).toBe(false);
        expect(link).toHaveAttribute('target', '_blank');
    });

    it('lets isExternal={false} route an absolute URL through next/link', () => {
        render(<NavLink to="https://example.com" isExternal={false}>Home</NavLink>);
        expect(isNextLink(screen.getByText('Home'))).toBe(true);
    });

    it('keeps noopener noreferrer when merging a custom rel', () => {
        render(<NavLink to="https://example.com" rel="nofollow noopener">Docs</NavLink>);
        expect(screen.getByText('Docs')).toHaveAttribute('rel', 'noopener noreferrer nofollow');
    });

    it('treats the _blank target case-insensitively', () => {
        render(<NavLink to="https://example.com" target="_BLANK" rel="nofollow">Docs</NavLink>);
        expect(screen.getByText('Docs')).toHaveAttribute('rel', 'noopener noreferrer nofollow');
    });

    it('respects an explicit target', () => {
        render(<NavLink to="https://example.com" target="_self">Docs</NavLink>);
        const link = screen.getByText('Docs');
        expect(link).toHaveAttribute('target', '_self');
        expect(link).not.toHaveAttribute('rel');
    });

    it('is never active', () => {
        setPathname('/about');
        render(<NavLink to="https://example.com/about">Docs</NavLink>);
        expect(screen.getByText('Docs')).not.toHaveClass('active');
        expect(screen.getByText('Docs')).not.toHaveAttribute('aria-current');
    });

    it('still calls onClick', () => {
        const onClick = vi.fn((event) => event.preventDefault());
        render(<NavLink to="https://example.com" onClick={onClick}>Docs</NavLink>);
        fireEvent.click(screen.getByText('Docs'));
        expect(onClick).toHaveBeenCalledTimes(1);
    });
});

describe('forwarded props', () => {
    it.each(['/about', 'https://example.com/about'])('preserves anchor-only attributes on links to %s', (to) => {
        render(<NavLink to={to} download="about.html" hrefLang="en" target="_self" rel="help">About</NavLink>);
        const link = screen.getByText('About');
        expect(link).toHaveAttribute('download', 'about.html');
        expect(link).toHaveAttribute('hreflang', 'en');
        expect(link).toHaveAttribute('target', '_self');
        expect(link).toHaveAttribute('rel', 'help');
    });

    it('sets id and data-testid', () => {
        render(<NavLink to="/about" id="about-link" testId="about">About</NavLink>);
        const link = screen.getByTestId('about');
        expect(link).toHaveAttribute('id', 'about-link');
    });

    it('forwards other anchor attributes and event handlers', () => {
        const onMouseEnter = vi.fn();
        render(
            <NavLink to="/about" title="Learn more" aria-label="About us" data-section="nav" onMouseEnter={onMouseEnter}>
                About
            </NavLink>,
        );
        const link = screen.getByText('About');
        expect(link).toHaveAttribute('title', 'Learn more');
        expect(link).toHaveAttribute('aria-label', 'About us');
        expect(link).toHaveAttribute('data-section', 'nav');
        fireEvent.mouseEnter(link);
        expect(onMouseEnter).toHaveBeenCalledTimes(1);
    });

    it('keeps supporting the `aria` object', () => {
        render(<NavLink to="/about" aria={{ 'aria-label': 'About us', 'aria-haspopup': 'true' }}>About</NavLink>);
        const link = screen.getByText('About');
        expect(link).toHaveAttribute('aria-label', 'About us');
        expect(link).toHaveAttribute('aria-haspopup', 'true');
    });

    it('lets data-testid from rest props through when testId is not set', () => {
        render(<NavLink to="/about" data-testid="from-rest">About</NavLink>);
        expect(screen.getByTestId('from-rest')).toBeInTheDocument();
    });

    it('forwards the ref to the anchor (and accepts a ref typed as HTMLAnchorElement)', () => {
        const ref = createRef<HTMLAnchorElement>();
        render(<NavLink to="/about" ref={ref}>About</NavLink>);
        expect(ref.current).toBe(screen.getByText('About'));
        expect(ref.current?.tagName).toBe('A');
    });

    it('forwards the ref to the span when disabled', () => {
        const ref = createRef<HTMLElement>();
        render(<NavLink to="/about" disabled ref={ref}>About</NavLink>);
        expect(ref.current?.tagName).toBe('SPAN');
    });

    it('forwards the ref to plain external anchors', () => {
        const ref = createRef<HTMLElement>();
        render(<NavLink to="https://example.com" ref={ref}>Docs</NavLink>);
        expect(ref.current?.tagName).toBe('A');
    });
});

describe('useIsActive', () => {
    it('follows the current pathname with the same rules as NavLink', () => {
        setPathname('/blog/post-1');
        expect(renderHook(() => useIsActive('/blog')).result.current).toBe(true);
        expect(renderHook(() => useIsActive('/blog', { matchMode: 'exact' })).result.current).toBe(false);
        expect(renderHook(() => useIsActive('/blog', { matchMode: 'startsWith' })).result.current).toBe(true);
        expect(renderHook(() => useIsActive('/x', { customActiveUrl: '/blog' })).result.current).toBe(true);
        expect(renderHook(() => useIsActive('/')).result.current).toBe(false);
    });
});
