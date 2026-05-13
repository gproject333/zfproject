// Augment ImportMeta with `glob`, which Vitest provides at runtime for
// our convex-test files. Avoids depending on `vite/client` types, which
// pnpm doesn't hoist to a top-level resolution path.
interface ImportMeta {
  glob: (pattern: string) => Record<string, () => Promise<unknown>>;
}
