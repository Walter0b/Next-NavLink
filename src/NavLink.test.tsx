import { jest } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import NavLink from './NavLink';
import { usePathname, useRouter } from 'next/navigation';

// Mock the next/navigation hooks
jest.mock('next/navigation', () => ({
    usePathname: jest.fn(),
    useRouter: jest.fn(),
}));

describe('NavLink', () => {
    const mockPush = jest.fn();
    const mockReplace = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (usePathname as jest.Mock).mockReturnValue('/');
        (useRouter as jest.Mock).mockReturnValue({
            push: mockPush,
            replace: mockReplace,
        });
    });

    it('renders correctly', () => {
        render(<NavLink to="/about">About</NavLink>);
        expect(screen.getByText('About')).toBeInTheDocument();
    });

    it('applies active className when path matches', () => {
        (usePathname as jest.Mock).mockReturnValue('/about');
        render(<NavLink to="/about" activeClassName="active">About</NavLink>);
        expect(screen.getByText('About')).toHaveClass('active');
    });

    it('applies inactive className when path does not match', () => {
        (usePathname as jest.Mock).mockReturnValue('/');
        render(<NavLink to="/about" inActiveClassName="inactive">About</NavLink>);
        expect(screen.getByText('About')).toHaveClass('inactive');
    });

    it('calls push on click when redirection is true', () => {
        render(<NavLink to="/about">About</NavLink>);
        fireEvent.click(screen.getByText('About'));
        expect(mockPush).toHaveBeenCalledWith('/about');
    });

    it('calls replace on click when replace prop is true', () => {
        render(<NavLink to="/about" replace>About</NavLink>);
        fireEvent.click(screen.getByText('About'));
        expect(mockReplace).toHaveBeenCalledWith('/about');
    });

    it('does not call push on click when redirection is false', () => {
        render(<NavLink to="/about" redirection={false}>About</NavLink>);
        fireEvent.click(screen.getByText('About'));
        expect(mockPush).not.toHaveBeenCalled();
    });

    it('renders external link correctly', () => {
        render(<NavLink to="https://external.com" isExternal>External</NavLink>);
        const link = screen.getByText('External').closest('a');
        expect(link).toHaveAttribute('href', 'https://external.com');
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('renders as a span when redirection is false', () => {
        render(<NavLink to="/about" redirection={false}>About</NavLink>);
        expect(screen.getByText('About').closest('span')).toBeInTheDocument();
    });

    it('renders as a span when disabled is true', () => {
        render(<NavLink to="/about" disabled>About</NavLink>);
        expect(screen.getByText('About').closest('span')).toBeInTheDocument();
    });

    it('applies custom className', () => {
        render(<NavLink to="/about" className="custom-class">About</NavLink>);
        expect(screen.getByText('About')).toHaveClass('custom-class');
    });

    it('calls onClick prop when clicked', () => {
        const onClickMock = jest.fn();
        render(<NavLink to="/about" onClick={onClickMock}>About</NavLink>);
        fireEvent.click(screen.getByText('About'));
        expect(onClickMock).toHaveBeenCalled();
    });

    it('applies active style when path matches', () => {
        (usePathname as jest.Mock).mockReturnValue('/about');
        render(<NavLink to="/about" activeStyle={{ color: 'red' }}>About</NavLink>);
        expect(screen.getByText('About')).toHaveStyle({ color: 'red' });
    });

    it('applies inactive style when path does not match', () => {
        (usePathname as jest.Mock).mockReturnValue('/');
        render(<NavLink to="/about" inactiveStyle={{ color: 'blue' }}>About</NavLink>);
        expect(screen.getByText('About')).toHaveStyle({ color: 'blue' });
    });

    it('renders children as a function', () => {
        render(<NavLink to="/about">{(isActive) => isActive ? 'Active' : 'Inactive'}</NavLink>);
        expect(screen.getByText('Inactive')).toBeInTheDocument();
    });

    it('handles different match modes correctly', () => {
        (usePathname as jest.Mock).mockReturnValue('/about/us');

        const { rerender } = render(<NavLink to="/about" matchMode="exact">About</NavLink>);
        expect(screen.getByText('About')).not.toHaveClass('active');

        rerender(<NavLink to="/about" matchMode="startsWith">About</NavLink>);
        expect(screen.getByText('About')).toHaveClass('active');

        rerender(<NavLink to="/about" matchMode="includes">About</NavLink>);
        expect(screen.getByText('About')).toHaveClass('active');
    });

    it('applies data-testid', () => {
        render(<NavLink to="/about" testId="about-link">About</NavLink>);
        expect(screen.getByTestId('about-link')).toBeInTheDocument();
    });
});
