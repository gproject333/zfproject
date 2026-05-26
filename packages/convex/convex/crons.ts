import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

/**
 * Daily housekeeping jobs. Convex auto-discovers this file; no extra
 * config needed. UTC 03:00 ≈ 06:00 Amman (UTC+3) — quiet hour on the
 * platform.
 */
const crons = cronJobs();

crons.daily(
  "cleanup-old-notifications",
  { hourUTC: 3, minuteUTC: 0 },
  internal.notifications.cleanupOld,
);

crons.daily(
  "whatsapp-retry-failed",
  { hourUTC: 4, minuteUTC: 0 },
  internal.whatsapp.internal.retryFailed,
);

export default crons;
