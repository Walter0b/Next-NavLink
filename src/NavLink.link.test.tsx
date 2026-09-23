import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation.js';
import { createRef } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import NavLink from './index';

// Same behavior checks as NavLink.test.tsx, but with the real `next/link` of the installed Next.js
// version. This is what the CI compatibility matrix (Next 13 -> 16) really exercises.
vi.mock('next/navigation.js', () => ({ usePathname: vi.fn() }));

beforeEach(() => {
    vi.mocked(usePathname).mockReturnValue('/');
});

describe('with the real next/link', () => {
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
