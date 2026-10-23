// OpenCode loads local plugin directories by resolving `index.ts` / `index.js`
// directly in the directory root (it does NOT read package.json `main` for
// local paths). This file is that entrypoint: it re-exports the plugin
// implementation from `src/`. No build step is required for local usage;
// `dist/` is produced by `npm run build` for package consumers.
export { default } from "./src/index.ts"