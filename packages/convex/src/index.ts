/**
 * Public surface of the @smart-zuj/convex backend package.
 *
 * Frontends (web, mobile) consume the generated `api` reference and
 * dataModel types from here so they never have to reach into the
 * package's internal directory layout.
 *
 * Shared backend-vs-frontend modules (currently just `lib/statuses`)
 * are exposed as a subpath export (@smart-zuj/convex/statuses) — see
 * package.json `exports`. This keeps the main entry tree-shakeable and
 * surfaces shared state-machine code under an intentional name.
 */
export { api, internal, components } from "../convex/_generated/api";
export type {
  Doc,
  Id,
  DataModel,
  TableNames,
} from "../convex/_generated/dataModel";
