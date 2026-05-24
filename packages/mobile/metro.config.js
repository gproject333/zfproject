/**
 * Metro config for a pnpm-workspace Expo app.
 *
 * Metro's default file watcher only looks inside the project directory,
 * which breaks pnpm symlinks pointing at packages elsewhere in the
 * monorepo. We extend `watchFolders` with the repo root so changes in
 * @smart-zuj/core and @smart-zuj/convex live-reload here, and append
 * the repo-root node_modules to `nodeModulesPaths` so Metro resolves
 * hoisted deps (react, react-native, convex) the same way Expo's CLI
 * does at install time.
 *
 * Disabling `resolver.disableHierarchicalLookup` keeps the standard
 * Node resolution semantics (walk parents looking for node_modules);
 * pnpm's `.pnpm/` virtual store lives under repo-root node_modules so
 * the lookup terminates there.
 */
const { getDefaultConfig } = require("expo/metro-config");
const path = require("node:path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "..", "..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

config.resolver.disableHierarchicalLookup = false;

module.exports = config;
