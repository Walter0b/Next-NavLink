# Contributing

Contributions are welcome! If you have suggestions, bug reports or feature requests, open an issue or a pull request. Please run `npm test` and `npm run typecheck` first, and add a test with your change.

## Development

Use Node.js 22.12 or newer for the development tools. CI uses Node.js 22.

```bash
npm ci
npm test               # unit tests (Vitest + Testing Library)
npm run typecheck      # tsc --noEmit
npm run build          # tsup -> dist/ (ESM, CJS and type declarations)
npm run check:package  # build output sanity checks, publint, Are the types wrong?
```

To try another Next.js / React version locally, the same way CI does:

```bash
npm install --no-save --package-lock=false next@14 react@18 react-dom@18 @types/react@18 @types/react-dom@18
npm run typecheck && npm test
```

Run `npm ci` to restore the locked dependencies afterwards. The compatibility tests exercise the installed `next/link` with a mocked router; they do not replace browser tests in a running Next.js app.

## Releasing

1. Update [CHANGELOG.md](./CHANGELOG.md), run the checks above, and commit your changes.
2. `npm version <patch|minor|major>` bumps `package.json`, commits and tags `vX.Y.Z`.
3. `git push --follow-tags`.

The [publish workflow](./.github/workflows/publish.yml) runs on the tag: it checks that the tag matches `package.json`, runs the tests, publishes to npm with provenance (pre-release versions such as `2.1.0-beta.1` go to the `next` dist-tag) and creates the GitHub release. It needs an `NPM_TOKEN` repository secret.

If you publish by hand with `npm publish` instead, do not push the version tag: the workflow would fail because that version already exists on npm.
