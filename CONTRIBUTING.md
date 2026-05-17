# Contributing

Thanks for helping improve Nactograph.

## Development

Use Node 24 or newer and pnpm:

```sh
pnpm install
pnpm verify
```

## Pull Requests

- Create a focused branch for each logical change.
- Use Conventional Commits, such as `feat: add event schema`.
- Add tests with behavior changes.
- Keep secrets, `.env` files, and generated private session data out of commits.

## Release Flow

Releases are created from tags. The release workflow publishes the npm package with trusted publishing and attaches binary artifacts.
