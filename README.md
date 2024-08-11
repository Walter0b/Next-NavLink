# Next-NavLink

`Next-NavLink` is a customizable navigation link component for Next.js applications. I know what you're thinking: "Another NavLink component?" But hear me out... this one’s different. It lets you easily create navigation links with active states, conditional classes, and yes even support for different matching modes to determine the active state, among other features.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Props](#props)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)

## Installation

```bash
npm install next-navlink
```

Or, if you’re more of a yarn person:

```bash
yarn add next-navlink
```

Or, if you’re feeling adventurous:

```bash
bun install next-navlink
```

## Usage

Here's a basic example of how to use the NavLink component in your Next.js project:

```tsx
import React from "react";
import NavLink from "next-navlink";

const Navbar = () => {
  return (
    <nav>
      <NavLink to="/home" activeClassName="active" className="nav-link">
        Home
      </NavLink>
      <NavLink to="/about" activeClassName="active" className="nav-link">
        About
      </NavLink>
      <NavLink
        to="/contact"
        activeClassName="active"
        className="nav-link"
        redirection={false}
      >
        Contact
      </NavLink>
    </nav>
  );
};

export default Navbar;
```

## Props

The `NavLink` component accepts the following props:

| Prop                | Type                                                          | Description                                                                                                                                                   | Default      |
| ------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| `children`          | `React.ReactNode` or `(isActive: boolean) => React.ReactNode` | The content to be rendered inside the link. It can be a React node or a function that returns a React node, allowing customization based on the active state. | -            |
| `activeClassName`   | `string`                                                      | The class name to apply when the link is active.                                                                                                              | `active`     |
| `inActiveClassName` | `string`                                                      | The class name to apply when the link is not active.                                                                                                          | `''`         |
| `className`         | `string`                                                      | Additional class names to apply to the link.                                                                                                                  | `''`         |
| `to`                | `string`                                                      | The target path to navigate to when the link is clicked.                                                                                                      | -            |
| `redirection`       | `boolean`                                                     | If `true`, the link redirects to the specified path. If `false`, it renders a `<span>` instead, disabling the navigation.                                     | `true`       |
| `id`                | `string`                                                      | The `id` attribute to apply to the link element.                                                                                                              | -            |
| `onClick`           | `() => void`                                                  | A function to call when the link is clicked.                                                                                                                  | -            |
| `matchMode`         | `'exact' \| 'includes' \| 'startsWith'`                       | Determines the matching behavior for the active state.                                                                                                        | `'includes'` |
| `replace`           | `boolean`                                                     | If `true`, replaces the current history state instead of adding a new URL to the stack.                                                                       | `false`      |
| `scroll`            | `boolean`                                                     | If `true`, scrolls to the top of the page after navigation.                                                                                                   | `true`       |
| `prefetch`          | `boolean`                                                     | If `true`, prefetches the page in the background when the link is in the viewport.                                                                            | `true`       |
| `isExternal`        | `boolean`                                                     | If `true`, the link will open in a new tab and will be treated as an external link.                                                                           | `false`      |
| `aria`              | `{ [key: string]: string }`                                   | An object of ARIA attributes to apply to the link element.                                                                                                    | -            |
| `testId`            | `string`                                                      | A test ID to apply to the link element for testing purposes.                                                                                                  | -            |
| `disabled`          | `boolean`                                                     | If `true`, disables the link, preventing navigation and click events.                                                                                         | `false`      |
| `activeStyle`       | `React.CSSProperties`                                         | An object containing inline styles to apply when the link is active.                                                                                          | -            |
| `inactiveStyle`     | `React.CSSProperties`                                         | An object containing inline styles to apply when the link is inactive.                                                                                        | -            |
| `customActiveUrl`   | `string`                                                      | The link will be considered active when the current pathname matches this URL.                                                                                | -            |

## Examples

### Using `replace`, `scroll`, and `prefetch`

Here’s how you can make the most of these props with `NavLink`:

```tsx
<NavLink
  to="/about"
  activeClassName="active"
  className="nav-link"
  replace={true}
  scroll={false}
  prefetch={true}
>
  About Us
</NavLink>
```

### Conditional Rendering

Want to customize the link content based on whether it’s active? Here’s how:

```tsx
<NavLink to="/profile" className="nav-link">
  {(isActive) => (
    <span>{isActive ? "Your Profile (Active)" : "Your Profile"}</span>
  )}
</NavLink>
```

You even might want a link to be considered active based on a different URL than the one it actually points to.

```tsx
Copy code
<NavLink
  to="/profile/edit"
  customActiveUrl="/profile"
  activeClassName="active"
  className="nav-link"
>
  Edit Profile
</NavLink>
```

### Styling Links

You can style active and inactive links easily:

```tsx
<NavLink
  to="/dashboard"
  activeClassName="text-bold text-primary"
  inActiveClassName="text-muted"
  className="nav-link"
>
  Dashboard
</NavLink>
```

### Disabling Redirection

Need a link that doesn’t actually navigate for some reasons? No problem:

```tsx
<NavLink to="/settings" redirection={false} className="nav-link">
  Settings
</NavLink>
```

### Using `matchMode`

#### Exact Match

Want the link to be active only when the URL exactly matches? Use this:

```tsx
<NavLink
  to="/log"
  matchMode="exact"
  activeClassName="active"
  className="nav-link"
>
  Log
</NavLink>
```

#### Starts With Match

Make the link active for any path that starts with the specified path:

```tsx
<NavLink
  to="/blog"
  matchMode="startsWith"
  activeClassName="active"
  className="nav-link"
>
  Blog
</NavLink>
```

#### Includes Match (Default)

By default, `NavLink` matches if the path is included as a substring:

```tsx
<NavLink to="/profile" activeClassName="active" className="nav-link">
  Profile
</NavLink>
```

## Contributing

Contributions are welcome! If you have suggestions, bug reports, or feature requests, feel free to open an issue or submit a pull request.

## License

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
