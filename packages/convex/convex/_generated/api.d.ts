/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as activityLogs from "../activityLogs.js";
import type * as applications_shared from "../applications/shared.js";
import type * as applications_sponsor from "../applications/sponsor.js";
import type * as applications_student from "../applications/student.js";
import type * as applications_supervisor from "../applications/supervisor.js";
import type * as articles from "../articles.js";
import type * as banners from "../banners.js";
import type * as colleges from "../colleges.js";
import type * as crons from "../crons.js";
import type * as entrepreneurialGuide from "../entrepreneurialGuide.js";
import type * as files from "../files.js";
import type * as http from "../http.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_notifications from "../lib/notifications.js";
import type * as lib_statuses from "../lib/statuses.js";
import type * as lib_uploads from "../lib/uploads.js";
import type * as lib_users from "../lib/users.js";
import type * as lib_validation from "../lib/validation.js";
import type * as meetings from "../meetings.js";
import type * as notifications from "../notifications.js";
import type * as seedContent from "../seedContent.js";
import type * as seedImages from "../seedImages.js";
import type * as socialLinks from "../socialLinks.js";
import type * as studentNotes from "../studentNotes.js";
import type * as supervisorUpgradeRequests from "../supervisorUpgradeRequests.js";
import type * as users from "../users.js";
import type * as users_admin from "../users/admin.js";
import type * as users_adminActions from "../users/adminActions.js";
import type * as users_dev from "../users/dev.js";
import type * as users_shared from "../users/shared.js";
import type * as whatsapp from "../whatsapp.js";
import type * as whatsapp_actions from "../whatsapp/actions.js";
import type * as whatsapp_admin from "../whatsapp/admin.js";
import type * as whatsapp_helpers from "../whatsapp/helpers.js";
import type * as whatsapp_internal from "../whatsapp/internal.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  activityLogs: typeof activityLogs;
  "applications/shared": typeof applications_shared;
  "applications/sponsor": typeof applications_sponsor;
  "applications/student": typeof applications_student;
  "applications/supervisor": typeof applications_supervisor;
  articles: typeof articles;
  banners: typeof banners;
  colleges: typeof colleges;
  crons: typeof crons;
  entrepreneurialGuide: typeof entrepreneurialGuide;
  files: typeof files;
  http: typeof http;
  "lib/auth": typeof lib_auth;
  "lib/notifications": typeof lib_notifications;
  "lib/statuses": typeof lib_statuses;
  "lib/uploads": typeof lib_uploads;
  "lib/users": typeof lib_users;
  "lib/validation": typeof lib_validation;
  meetings: typeof meetings;
  notifications: typeof notifications;
  seedContent: typeof seedContent;
  seedImages: typeof seedImages;
  socialLinks: typeof socialLinks;
  studentNotes: typeof studentNotes;
  supervisorUpgradeRequests: typeof supervisorUpgradeRequests;
  users: typeof users;
  "users/admin": typeof users_admin;
  "users/adminActions": typeof users_adminActions;
  "users/dev": typeof users_dev;
  "users/shared": typeof users_shared;
  whatsapp: typeof whatsapp;
  "whatsapp/actions": typeof whatsapp_actions;
  "whatsapp/admin": typeof whatsapp_admin;
  "whatsapp/helpers": typeof whatsapp_helpers;
  "whatsapp/internal": typeof whatsapp_internal;
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
