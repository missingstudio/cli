# Repository Guidelines

## Project Structure & Module Organization

- Source: `src/` (entry: `src/index.ts`). Submodules: `commands/` (CLI subcommands), `components/` (Ink/React UI), `ui/` (top-level TUI), `mcp/` (MCP helpers), `config/`.
- Build output: `dist/` (Node ESM, published via `bin` as `mstudio` and `missingstudio`).
- Tests: colocated as `**/*.{test,spec}.ts(x)` inside `src/`.
- Assets: `assets/` (images). Repo config under `.github/`, `.husky/`, `.changeset/`.

## Build, Test, and Development Commands

- `npm run dev`: Start locally with `tsx` (watches `src/`).
- `npm run build`: TypeScript compile to `dist/`.
- `npm start`: Build then run `dist/index.js`.
- `npm test` / `npm run test:watch`: Run Vitest once / in watch mode.
- `npm run typecheck`: TS type checking without emit.
- `npm run format` / `format:fix`: Check / write Prettier formatting.
- `npm run ci`: Formatting check + tests (used in CI).

Example local run:

```
npm install
npm run dev
# or: npm start
```

## Coding Style & Naming Conventions

- Language: TypeScript (ESM). Indent 2 spaces; semicolons; trailing commas; `printWidth: 80` (enforced by Prettier).
- Filenames: kebab-case (`mcp-list.tsx`); React components in PascalCase exports (`AsciiLogo`).
- Functions/variables: camelCase; types/interfaces: PascalCase.
- Do not import from `dist/`; import via relative TS paths.

## Testing Guidelines

- Framework: Vitest with globals and Node env (`vitest.config.ts`).
- Place tests next to source: `foo.test.ts(x)`.
- Useful commands: `npm test` (CI), `npm run test:watch` (local).
- Coverage is collected (v8) and emitted to `coverage/`; keep meaningful coverage for new code.

## Commit & Pull Request Guidelines

- Conventional Commits enforced by commitlint (Husky hooks run format + commitlint).
- Examples: `feat(cli): add mcp list`, `fix(ui): handle empty state`, `chore: bump deps`.
- PRs: include summary, motivation, linked issues, and CLI/TUI screenshots when visual output changes. Ensure `npm run ci` passes.

## Security & Configuration Tips

- Configuration: `.mstudio.json` defines MCP servers; avoid committing secrets. Environment variables via `.env` (loaded by `dotenv`).
- Do not commit build artifacts or generated files outside `dist/`.
