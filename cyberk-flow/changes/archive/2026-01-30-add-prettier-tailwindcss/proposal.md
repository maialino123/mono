# Change: Add Prettier Tailwind CSS Plugin

## Why

Tailwind CSS class names in `.tsx` files were not being sorted on format, making them inconsistent and harder to read.

## What Changes

- Installed `prettier` and `prettier-plugin-tailwindcss` as dev dependencies in `apps/web`
- Created `apps/web/prettier.config.mjs` with Tailwind v4 support (`tailwindStylesheet` pointing to `src/index.css`) and class sorting in utility functions (`clsx`, `cn`, `cva`)
- Updated `.vscode/settings.json` to use `esbenp.prettier-vscode` as the default formatter for `typescriptreact` files

## Impact

- Affected code: `apps/web/prettier.config.mjs`, `apps/web/package.json`, `.vscode/settings.json`
- No breaking changes
