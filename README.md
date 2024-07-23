# Next-NavLink

The `Next-NavLink` component is a customizable navigation link component for Next.js applications, i know there are a lot out there but just hear me out..this one is different. It allows you to easily create navigation links with active states, conditional classes,but wait there is more, with support for various matching modes to determine the active state.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Props](#props)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)

## Installation

To use the `NavLink` component in your Next.js project, you can install it via npm:

```bash
npm install next-navlink
```

Or, if you're using yarn:

```bash
yarn add next-navlink
```

Or, my favorite:

```bash
bun install next-navlink
```

## Usage

Here's a basic example of how to use the `NavLink` component in your Next.js project:

```tsx
import React from 'react'
import NavLink from 'next-navlink'

const Navbar = () => {
  return (
    <nav>
      <NavLink to="/home" activeClassName="active" className="nav-link">
        Home
      </NavLink>
      <NavLink to="/about" activeClassName="active" className="nav-link">
        About
      </NavLink>
      <NavLink to="/contact" activeClassName="active" className="nav-link" redirection={false}>
        Contact
      </NavLink>
    </nav>
  )
}

export default Navbar
```

## Props

The `NavLink` component accepts the following props:

| Prop                  | Type                                                   | Description                                                                                                                                   | Default         |
|-----------------------|--------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|-----------------|
| `children`            | `React.ReactNode` or `(isActive: boolean) => React.ReactNode` | The content to be rendered inside the link. It can be a React node or a function that returns a React node, allowing customization based on the active state. | -               |
| `activeClassName`     | `string`                                               | The class name to apply when the link is active.                                                                                              | `active`        |
| `conditionalClassName`| `string`                                               | The class name to apply when the link is not active.                                                                                          | `''`            |
| `className`           | `string`                                               | Additional class names to apply to the link.                                                                                                  | `''`            |
| `to`                  | `string`                                               | The target path to navigate to when the link is clicked.                                                                                      | -               |
| `redirection`         | `boolean`                                              | If `true`, the link redirects to the specified path. If `false`, it renders a `<span>` instead, disabling the navigation.                     | `true`          |
| `id`                  | `string`                                               | The `id` attribute to apply to the link element.                                                                                               | -               |
| `onClick`             | `() => void`                                           | A function to call when the link is clicked.                                                                                                  | -               |
| `matchMode`           | `'exact' | 'includes' | 'startsWith'`                     | Determines the matching behavior for the active state.                                                                                        | `'includes'`    |

### `matchMode` Options

The `matchMode` prop controls how the active state is determined:

- **`'exact'`**: The link is active only if the current pathname exactly matches the `to` path.
- **`'includes'`**: The link is active if the `to` path is a substring of the current pathname (default).
- **`'startsWith'`**: The link is active if the current pathname starts with the `to` path.

## Examples

### Conditional Rendering

The `NavLink` component supports conditional rendering of children based on the active state:

```tsx
<NavLink to="/profile" className="nav-link">
  {(isActive) => (
    <span>
      {isActive ? 'Your Profile (Active)' : 'Your Profile'}
    </span>
  )}
</NavLink>
```

### Styling Links

You can easily style active and inactive links using the `activeClassName` and `conditionalClassName` props:

```tsx
<NavLink
  to="/dashboard"
  activeClassName="text-bold text-primary"
  conditionalClassName="text-muted"
  className="nav-link"
>
  Dashboard
</NavLink>
```

### Disabling Redirection

To disable redirection and render a `<span>` instead of a `<Link>`, set the `redirection` prop to `false`:

```tsx
<NavLink to="/settings" redirection={false} className="nav-link">
  Settings
</NavLink>
```

### Handling Click Events

You can handle click events by passing an `onClick` prop:

```tsx
<NavLink
  to="/logout"
  onClick={() => console.log('Logging out')}
  className="nav-link"
>
  Logout
</NavLink>
```

### Using `matchMode`

#### Exact Match

To ensure the link is active only when the URL matches exactly, use the `matchMode="exact"`:

```tsx
<NavLink to="/log" matchMode="exact" activeClassName="active" className="nav-link">
  Log
</NavLink>
```

- **Active** for `/log` only.

#### Starts With Match

To activate the link for any path that starts with the specified path, use `matchMode="startsWith"`:

```tsx
<NavLink to="/blog" matchMode="startsWith" activeClassName="active" className="nav-link">
  Blog
</NavLink>
```

- **Active** for paths like `/blog`, `/blog/post-1`, `/blog/categories`.

#### Includes Match (Default)

The default behavior is to match if the path is included as a substring. This is useful for broader matches:

```tsx
<NavLink to="/profile" activeClassName="active" className="nav-link">
  Profile
</NavLink>
```

- **Active** for `/profile`, `/profile/edit`, `/profile/settings`.

## Contributing

Contributions are welcome! If you have suggestions, bug reports, or feature requests, feel free to open an issue or submit a pull request.

## License

Do Whatever
