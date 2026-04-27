/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as applications_shared from "../applications/shared.js";
import type * as applications_sponsor from "../applications/sponsor.js";
import type * as applications_student from "../applications/student.js";
import type * as applications_supervisor from "../applications/supervisor.js";
import type * as articles from "../articles.js";
import type * as banners from "../banners.js";
import type * as files from "../files.js";
import type * as http from "../http.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_notifications from "../lib/notifications.js";
import type * as lib_statuses from "../lib/statuses.js";
import type * as lib_users from "../lib/users.js";
import type * as lib_validation from "../lib/validation.js";
import type * as notifications from "../notifications.js";
import type * as presence from "../presence.js";
import type * as socialLinks from "../socialLinks.js";
import type * as studentNotes from "../studentNotes.js";
import type * as users from "../users.js";
import type * as users_admin from "../users/admin.js";
import type * as users_dev from "../users/dev.js";
import type * as users_shared from "../users/shared.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "applications/shared": typeof applications_shared;
  "applications/sponsor": typeof applications_sponsor;
  "applications/student": typeof applications_student;
  "applications/supervisor": typeof applications_supervisor;
  articles: typeof articles;
  banners: typeof banners;
  files: typeof files;
  http: typeof http;
  "lib/auth": typeof lib_auth;
  "lib/notifications": typeof lib_notifications;
  "lib/statuses": typeof lib_statuses;
  "lib/users": typeof lib_users;
  "lib/validation": typeof lib_validation;
  notifications: typeof notifications;
  presence: typeof presence;
  socialLinks: typeof socialLinks;
  studentNotes: typeof studentNotes;
  users: typeof users;
  "users/admin": typeof users_admin;
  "users/dev": typeof users_dev;
  "users/shared": typeof users_shared;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
