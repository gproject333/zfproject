import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";
import convexPlugin from "@convex-dev/eslint-plugin";

export default defineConfig([
  ...tseslint.configs.recommended,
  ...convexPlugin.configs.recommended,
  globalIgnores(["convex/_generated"]),
]);
