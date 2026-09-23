# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project adheres to
[Semantic Versioning](https://semver.org/).

## [2.0.1] - 2026-09-23

### Changed

- The README now only documents how to use the package. Contributor and release notes moved to `CONTRIBUTING.md`.
- Clarified relative URL matching, external-link overrides, keyboard interaction, and Next.js rendering constraints.
- Include `CONTRIBUTING.md` in the published package so the README's contribution link works.

### Fixed

- Disabled links cannot override their disabled announcement or re-enter the tab order through `aria-disabled` or `tabIndex`.
- Anchor-only attributes are no longer forwarded to spans rendered by `disabled` or `redirection={false}`.
- External links recognize `_blank` case-insensitively when adding `noopener noreferrer`.

### Tooling

- Added regression tests for disabled links and router navigation, including `replace`, `scroll`, canceled clicks and modifier keys.
- Updated the Vitest configuration for ESM loading and automatic JSX handling; console spies are restored between tests.

## [2.0.0] - 2026-09-23

Mostly a bug-fix and modernization release. It is a major because a few behaviors change and the
supported Next.js / React ranges moved. See "Migrating from 1.x" in the README.

### Breaking changes

- **Supported versions**: peer dependencies are now `next ^13.4 || ^14 || ^15 || ^16` and
  `react ^18 || ^19`. Next.js 12 (which has no `next/navigation`) and React 16/17 are no longer declared.
- **Navigation is delegated to `next/link`.** The component no longer calls `preventDefault()` and
  `router.push()` / `router.replace()` itself. As a result `scroll={false}` now works, Cmd/Ctrl/Shift-click
  opens a new tab instead of navigating the current one, and `onClick` can cancel a navigation with
  `event.preventDefault()`.
- **A link to `/` is only active on `/`**, in every match mode. It used to be active on every page with the
  default `includes` mode.
- **`startsWith` matches whole path segments**: `/blog` matches `/blog` and `/blog/post`, no longer `/blogger`.
- **`prefetch` no longer defaults to `true`.** It follows Next.js' default; pass `prefetch` to opt in explicitly.
- **Element children no longer receive an `isActive` prop.** It made React warn when the child was a DOM element.
  Use the function form: `{(isActive) => ...}`.
- **`aria-disabled="false"` is no longer rendered** on enabled links.
- **Package layout**: the entry point moved from `dist/src/NavLink.js` to `dist/index.{js,mjs}` and an `exports`
  map was added, so deep imports of internal files are no longer possible.

### Added

- `"use client"` directive in the build output: `NavLink` can be imported from Server Components (root layout...).
  Before, doing so failed the production build.
- ESM and CommonJS builds with type declarations for both, and `sideEffects: false`.
- `aria-current="page"` on the active link.
- `ref` forwarding.
- Every `<a>` attribute is forwarded (`title`, `target`, `rel`, `style`, `data-*`, `aria-*`, event handlers...).
  `style` is merged with `activeStyle` / `inactiveStyle`.
- Automatic external-link detection from `to` (`https:`, `http:`, `//`, `mailto:`, `tel:`...); `isExternal` can still
  force or prevent it. `mailto:` / `tel:` links do not open in a new tab. A custom `rel` is merged with
  `noopener noreferrer`.
- `useIsActive(to, { matchMode, customActiveUrl })` hook.
- `inactiveClassName` (consistent with `inactiveStyle`); `inActiveClassName` is deprecated but still works.
- Named export `NavLink` next to the default export, and exported `NavLinkProps`, `MatchMode` and
  `UseIsActiveOptions` types.
- Query strings, hashes and trailing slashes are ignored when matching (`to="/search?q=x"` matches `/search`).
- `LICENSE` file and this changelog.

### Fixed

- `usePathname()` returning `null` (Pages Router fallback pages) crashed the component.
- Double spaces in the generated `class` attribute.

### Tooling

- Built with [tsup](https://tsup.egoist.sh/) (was `tsc` to ES5), tested with Vitest, TypeScript 5.9.
- New CI workflow: type-check and tests against Next 13.5 / 14 / 15 / 16, plus `publint` and
  [Are the types wrong?](https://arethetypeswrong.github.io) on the package.
- Releases are now cut from `v*` tags (with npm provenance and a GitHub release) instead of publishing a new
  patch version on every push to `main`.
- Dependabot for npm dependencies and GitHub Actions.

[2.0.1]: https://github.com/Walter0b/Next-NavLink/releases/tag/v2.0.1
[2.0.0]: https://github.com/Walter0b/Next-NavLink/releases/tag/v2.0.0
