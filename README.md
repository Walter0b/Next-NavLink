# Next-NavLink

[![npm version](https://img.shields.io/npm/v/next-navlink.svg)](https://www.npmjs.com/package/next-navlink)
[![CI](https://github.com/Walter0b/Next-NavLink/actions/workflows/ci.yml/badge.svg)](https://github.com/Walter0b/Next-NavLink/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

`next-navlink` adds active states to Next.js links. Choose how a URL matches the current page, apply classes or styles, and render different content when a link is active. Navigation stays with `next/link`.

Next.js [shows how to build active links with `usePathname`](https://nextjs.org/docs/app/api-reference/components/link#checking-active-links). This package turns that pattern into a reusable component with matching modes, accessibility attributes and external-link handling.

- **Active state** with three match modes, custom class names and inline styles, plus `aria-current="page"`.
- **Built on `next/link`**: prefetching, client-side navigation, `replace`, `scroll`, and correct Cmd/Ctrl/Shift-click behavior.
- **External links** detected automatically (new tab, `rel="noopener noreferrer"`).
- **`disabled` links**, function-as-children, `ref` forwarding, and standard anchor attributes.
- **Import from Server Components**: the package ships with the `"use client"` directive.
- Written in TypeScript, with ESM and CommonJS builds and no bundled React or Next.js runtime.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Compatibility](#compatibility)
- [Props](#props)
- [How matching works](#how-matching-works)
- [Examples](#examples)
- [`useIsActive`](#useisactive)
- [Server and Client Components](#server-and-client-components)
- [Accessibility](#accessibility)
- [Migrating from 1.x](#migrating-from-1x)
- [Contributing](#contributing)
- [License](#license)

## Installation

```bash
npm install next-navlink
```

Or use your preferred package manager:

```bash
yarn add next-navlink
pnpm add next-navlink
bun add next-navlink
```

## Usage

```tsx
// app/layout.tsx (a Server Component, that's fine)
import NavLink from "next-navlink";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav>
          <NavLink to="/" className="nav-link">
            Home
          </NavLink>
          <NavLink to="/blog" matchMode="startsWith" className="nav-link">
            Blog
          </NavLink>
          <NavLink to="/about" matchMode="exact" className="nav-link">
            About
          </NavLink>
          <NavLink to="https://github.com/Walter0b/Next-NavLink">GitHub</NavLink>
        </nav>
        {children}
      </body>
    </html>
  );
}
```

```css
.nav-link.active {
  font-weight: bold;
}
```

The component is available as a default export and as a named export: `import NavLink from "next-navlink"` and `import { NavLink } from "next-navlink"` are the same thing.

## Compatibility

| next-navlink | Next.js                   | React        |
| ------------ | ------------------------- | ------------ |
| 2.x          | 13.4, 14, 15, 16          | 18, 19       |
| 1.x          | 12, 14 (as declared)      | 16, 17, 18   |

The unit tests run against Next 13.5, 14, 15 and 16 in CI, and the built package is checked with [publint](https://publint.dev) and [Are the types wrong?](https://arethetypeswrong.github.io).

It uses `usePathname` from `next/navigation` in both the App Router and Pages Router. When the Pages Router has not initialized yet, links stay inactive until the pathname is available. Use the Node.js version required by your installed Next.js version.

## Props

Standard anchor attributes and event handlers are forwarded (`title`, `target`, `rel`, `data-*`, `aria-*`, `onMouseEnter`, `style`...). Anchor-only attributes such as `target`, `rel` and `download` are omitted when rendering a `<span>`.

| Prop                | Type                                                              | Default      | Description                                                                                                                                                  |
| ------------------- | ----------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `to`                | `string`                                                          | -            | **Required.** The destination: an internal path (`/about`) or an absolute URL (`https://example.com`).                                                       |
| `children`          | `ReactNode` or `(isActive: boolean) => ReactNode`                 | -            | The link content. Use the function form to render differently when active.                                                                                   |
| `activeClassName`   | `string`                                                          | `'active'`   | Class added when the link is active.                                                                                                                         |
| `inactiveClassName` | `string`                                                          | -            | Class added when the link is not active. (`inActiveClassName` still works but is deprecated.)                                                                |
| `className`         | `string`                                                          | -            | Class always added to the link.                                                                                                                              |
| `activeStyle`       | `CSSProperties`                                                   | -            | Inline styles added when active (merged over `style`).                                                                                                       |
| `inactiveStyle`     | `CSSProperties`                                                   | -            | Inline styles added when not active (merged over `style`).                                                                                                   |
| `matchMode`         | `'exact' \| 'startsWith' \| 'includes'`                           | `'includes'` | How the current pathname is compared with `to`. See [How matching works](#how-matching-works).                                                               |
| `customActiveUrl`   | `string`                                                          | -            | Match the current pathname against this URL instead of `to`.                                                                                                 |
| `redirection`       | `boolean`                                                         | `true`       | When `false`, renders a `<span>` and does not navigate. `onClick` still fires.                                                                               |
| `disabled`          | `boolean`                                                         | `false`      | Renders an inert `<span aria-disabled="true">`. `onClick` is not called.                                                                                     |
| `isExternal`        | `boolean`                                                         | auto         | Force (`true`) or prevent (`false`) external-link behavior. By default any absolute URL (`https:`, `//`, `mailto:`, `tel:`...) is external.                  |
| `replace`           | `boolean`                                                         | `false`      | Replace the current history entry instead of pushing a new one.                                                                                              |
| `scroll`            | `boolean`                                                         | `true`       | Scroll to the top of the page after navigation. Set `false` to keep the scroll position.                                                                     |
| `prefetch`          | `boolean \| null` (Next 15+: also `'auto'`)                       | Next default | Forwarded to `next/link`. Left untouched unless you set it.                                                                                                  |
| `onClick`           | `(event: MouseEvent) => void`                                     | -            | Click handler. Call `event.preventDefault()` to cancel the navigation.                                                                                       |
| `id`                | `string`                                                          | -            | The `id` of the element.                                                                                                                                     |
| `testId`            | `string`                                                          | -            | Sets `data-testid`.                                                                                                                                          |
| `aria`              | `Record<string, string>`                                          | -            | ARIA attributes as an object. You can also pass `aria-*` props directly, which is usually nicer.                                                             |
| `ref`               | `Ref<HTMLElement>`                                                | -            | Points to the rendered element: an `<a>`, or a `<span>` when `disabled` / `redirection={false}`.                                                             |

What ends up in the DOM:

- A `next/link` anchor for internal links, a plain `<a>` for external ones, a `<span>` for `disabled` / `redirection={false}`.
- `class="{className} {activeClassName | inactiveClassName} nav_links"`. The `nav_links` class is always there, use it as a hook for global styles.
- `aria-current="page"` on the active link and `aria-disabled="true"` on disabled ones.

## How matching works

The current pathname (from `usePathname()`) is compared with `customActiveUrl` or, when it is not set, `to`. Query strings, hashes and trailing slashes are ignored on both sides: `to="/search?q=next"` matches `/search`.

Given `to="/blog"`:

| Current pathname | `exact` | `startsWith` | `includes` |
| ---------------- | :-----: | :----------: | :--------: |
| `/blog`          |    ✓    |      ✓       |     ✓      |
| `/blog/post-1`   |    ✗    |      ✓       |     ✓      |
| `/blogger`       |    ✗    |      ✗       |     ✓      |
| `/en/blog`       |    ✗    |      ✗       |     ✓      |
| `/shop`          |    ✗    |      ✗       |     ✗      |

- `exact`: the pathname is the target.
- `startsWith`: the pathname is the target or lives under it. It matches whole path segments, so `/blogger` is not "under" `/blog`. This is what you want for section links.
- `includes` (default): the target appears anywhere in the pathname. Handy with locale prefixes (`/en/blog`), but it can produce false positives.

Two rules apply to every mode:

- A link to the root (`to="/"`) is only active on `/` itself. Otherwise your "Home" link would light up on every page.
- An external URL used as the matching target is never active. An explicit `customActiveUrl="/path"` can still give an external link an active state; `isExternal` controls rendering and navigation, not matching.

Use paths starting with `/` for predictable matching. Relative destinations such as `../settings` are passed to Next.js for navigation but are not resolved against the current route for active-state matching. Query-only and hash-only destinations are inactive unless you provide `customActiveUrl`.

## Examples

### `replace`, `scroll` and `prefetch`

```tsx
<NavLink to="/about" replace scroll={false} prefetch={false}>
  About Us
</NavLink>
```

### Render differently when active

```tsx
<NavLink to="/profile" matchMode="startsWith">
  {(isActive) => <span>{isActive ? "Your Profile (you are here)" : "Your Profile"}</span>}
</NavLink>
```

### Style with utility classes

`className` is always applied, `activeClassName` and `inactiveClassName` swap depending on the state:

```tsx
<NavLink
  to="/dashboard"
  matchMode="startsWith"
  className="rounded px-3 py-2"
  activeClassName="bg-gray-900 text-white"
  inactiveClassName="text-gray-600 hover:bg-gray-100"
>
  Dashboard
</NavLink>
```

### Inline styles

```tsx
<NavLink to="/settings" activeStyle={{ fontWeight: 700 }} inactiveStyle={{ opacity: 0.7 }}>
  Settings
</NavLink>
```

### Highlight a link for another URL

```tsx
<NavLink to="/profile/edit" customActiveUrl="/profile">
  Edit Profile
</NavLink>
```

### External links

Absolute URLs are detected. They open in a new tab with `rel="noopener noreferrer"`, except `mailto:` and `tel:` which stay plain anchors:

```tsx
<NavLink to="https://nextjs.org">Next.js</NavLink>
<NavLink to="https://nextjs.org" target="_self">Next.js in this tab</NavLink>
<NavLink to="mailto:hello@example.com">Say hello</NavLink>
<NavLink to="/docs" isExternal>Docs (served by another app)</NavLink>
```

### Disabled links and links that do not navigate

```tsx
<NavLink to="/billing" disabled>Billing</NavLink>
<NavLink to="/settings" redirection={false}>Settings (label only)</NavLink>
```

`redirection={false}` renders a `<span>`. It still accepts `onClick`, but has no built-in keyboard interaction. Use a `<button type="button">` for actions such as opening a modal.

### Cancel a navigation

```tsx
<NavLink
  to="/checkout"
  onClick={(event) => {
    if (!cartIsValid) event.preventDefault();
  }}
>
  Checkout
</NavLink>
```

### Refs and other attributes

```tsx
const ref = useRef<HTMLElement>(null);

<NavLink to="/about" ref={ref} title="Learn more about us" aria-label="About us" data-analytics="nav-about">
  About
</NavLink>;
```

## `useIsActive`

The hook behind `NavLink`, for when you want to style something *next to* a link:

```tsx
"use client";

import { useIsActive } from "next-navlink";

function BlogMenuIcon() {
  const isActive = useIsActive("/blog", { matchMode: "startsWith" });
  return <Icon name={isActive ? "book-open" : "book"} />;
}
```

It takes the same `matchMode` and `customActiveUrl` options as the component.

## Server and Client Components

`NavLink` is a Client Component, and the package is published with the `"use client"` directive, so you can import it from a Server Component (a layout, for instance) without adding the directive yourself.

Props sent from a Server Component to a Client Component have to be serializable. Plain values and style objects are fine; **functions are not**. So `onClick` and the function form of `children` only work when `NavLink` is rendered from a Client Component (a file starting with `"use client"`).

The same rendering constraints as [`usePathname`](https://nextjs.org/docs/app/api-reference/functions/use-pathname) apply:

- With Next.js Cache Components and dynamic parameters that are unknown during prerendering, wrap the navigation in `<Suspense>` with a fallback.
- Rewrites can make the server pathname differ from the browser pathname. In those routes, render a stable fallback until mount before showing pathname-dependent navigation to avoid hydration mismatches. This package does not defer active-state matching automatically.

## Accessibility

- The active link gets `aria-current="page"`. Override it with your own `aria-current` prop if the link means something else (`"location"`, `"step"`...).
- Disabled links render `<span aria-disabled="true" tabindex="-1">` and ignore `onClick`. The disabled state takes precedence over a supplied `aria-disabled` or `tabIndex`. They are removed from sequential keyboard navigation; keep their children non-interactive.
- External web links open in a new tab by default. Indicate that in the link text when useful, or pass `target="_self"` to stay in the current tab.
- Cmd/Ctrl/Shift-click, middle-click and "open in new tab" work as usual because navigation is left to `next/link`.

## Migrating from 1.x

Version 2 is mostly a bug-fix release, but it changes a few behaviors, hence the major bump. The full list is in the [changelog](./CHANGELOG.md).

| 1.x behavior                                                              | 2.x                                                                                                       |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Importing it in a Server Component failed to build                        | Works, the package has the `"use client"` directive                                                       |
| A link to `/` was active on every page (default `includes` mode)         | Only active on `/`                                                                                        |
| `startsWith` was a raw string prefix (`/blogger` matched `/blog`)         | Matches whole segments                                                                                    |
| Clicks were intercepted and sent through `router.push`                    | Handled by `next/link`: `scroll={false}` works, Cmd/Ctrl-click opens a new tab                            |
| `prefetch` defaulted to `true` (full prefetch)                            | Follows Next.js' default. Pass `prefetch` explicitly to get the old behavior                              |
| Element children received an `isActive` prop (React warned on DOM nodes)  | Removed. Use the function form: `{(isActive) => ...}`                                                     |
| `aria-disabled="false"` on every link                                     | Only `aria-disabled="true"` when disabled                                                                 |
| `next-navlink/dist/src/NavLink` deep import                               | Not exported. Import from `next-navlink`                                                                  |
| Peer dependencies: Next 12/14, React 16-18                                | Next 13.4-16, React 18-19                                                                                 |

Nothing changes for the props themselves: every 1.x prop still exists (`inActiveClassName` is deprecated in favor of `inactiveClassName`).

## Contributing

Bug reports, ideas and pull requests are welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md) for local setup, checks and release instructions.

## License

[MIT](./LICENSE)
