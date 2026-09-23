# Next-NavLink

[![npm version](https://img.shields.io/npm/v/next-navlink.svg)](https://www.npmjs.com/package/next-navlink)
[![CI](https://github.com/Walter0b/Next-NavLink/actions/workflows/ci.yml/badge.svg)](https://github.com/Walter0b/Next-NavLink/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

`Next-NavLink` is a navigation link component for Next.js. I know what you're thinking: "Another NavLink component?" But hear me out... it's a thin layer over `next/link` that knows whether it points at the current page, so you can style it, label it for screen readers and react to it, with a few matching modes to decide what "current" means.

- **Active state** with three match modes, custom class names and inline styles, plus `aria-current="page"`.
- **Built on `next/link`**: prefetching, client-side navigation, `replace`, `scroll`, and correct Cmd/Ctrl/Shift-click behavior.
- **External links** detected automatically (new tab, `rel="noopener noreferrer"`).
- **`disabled` links**, function-as-children, `ref` forwarding, and every `<a>` attribute passed through.
- **Works everywhere in the App Router**, including Server Components (the package ships with the `"use client"` directive).
- Typed, tiny (about 1.4 kB gzipped), ESM + CJS.

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
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## Installation

```bash
npm install next-navlink
```

Or, if you're more of a yarn person:

```bash
yarn add next-navlink
```

Or, if you're feeling adventurous:

```bash
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

It relies on `usePathname` from `next/navigation`, so it works in the App Router and, since Next 13, in the Pages Router too.

## Props

Any other prop is forwarded to the rendered element (`title`, `target`, `rel`, `data-*`, `aria-*`, `onMouseEnter`, `style`...).

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
- External URLs are never active.

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
<NavLink to="mailto:hello@example.com">Say hello</NavLink>
<NavLink to="/docs" isExternal>Docs (served by another app)</NavLink>
```

### Disabled links and links that do not navigate

```tsx
<NavLink to="/billing" disabled>Billing</NavLink>
<NavLink to="/settings" redirection={false} onClick={() => openSettingsModal()}>Settings</NavLink>
```

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

## Accessibility

- The active link gets `aria-current="page"`. Override it with your own `aria-current` prop if the link means something else (`"location"`, `"step"`...).
- Disabled links render `<span aria-disabled="true">`: not focusable and not announced as links. Target them in CSS with `[aria-disabled="true"]`.
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

## Development

```bash
npm install
npm test               # unit tests (Vitest + Testing Library)
npm run typecheck      # tsc --noEmit
npm run build          # tsup -> dist/ (ESM, CJS and type declarations)
npm run check:package  # build output sanity checks, publint, Are the types wrong?
```

To try another Next.js / React version locally, the same way CI does:

```bash
npm install --no-save next@14 react@18 react-dom@18 @types/react@18 @types/react-dom@18
npm run typecheck && npm test
```

### Releasing

1. Update [CHANGELOG.md](./CHANGELOG.md).
2. `npm version <patch|minor|major>` bumps `package.json`, commits and tags `vX.Y.Z`.
3. `git push --follow-tags`.

The [publish workflow](./.github/workflows/publish.yml) runs on the tag: it checks that the tag matches `package.json`, runs the tests, publishes to npm with provenance (pre-release versions such as `2.1.0-beta.1` go to the `next` dist-tag) and creates the GitHub release. It needs an `NPM_TOKEN` repository secret.

## Contributing

Contributions are welcome! If you have suggestions, bug reports, or feature requests, feel free to open an issue or submit a pull request. Please run `npm test` and `npm run typecheck` first, and add a test with your change.

## License

[MIT](./LICENSE)
