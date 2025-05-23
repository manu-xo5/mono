Welcome to pink parrot app!

# Building For Production

```bash
pnpm build
```

## Styling

This project uses [Tailwind CSS](https://tailwindcss.com/) for styling.

## Solid-UI

To install the components, run the following command (this install button):

```bash
npx solidui-cli@latest add button
```

## Routing

This project uses [TanStack Router](https://tanstack.com/router). The initial setup is a file based router. Which means that the routes are managed as fiels in `src/routes`.

## Linting & Formatting

This project uses [eslint](https://eslint.org/) and [prettier](https://prettier.io/) for linting and formatting. Eslint is configured using [tanstack/eslint-config](https://tanstack.com/config/latest/docs/eslint). The following scripts are available:

```bash
pnpm lint
pnpm format
pnpm check
```

# Roadmap

[ ] Create devtools for messageStore
[ ] fetch rooms with user data
