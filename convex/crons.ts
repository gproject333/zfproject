import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
  "prune-activity-logs",
  { hourUTC: 3, minuteUTC: 0 },
  internal.cleanup.pruneActivityLogs,
  {},
);

crons.hourly(
  "prune-presence",
  { minuteUTC: 17 },
  internal.cleanup.prunePresence,
  {},
);

crons.daily(
  "prune-read-notifications",
  { hourUTC: 3, minuteUTC: 30 },
  internal.cleanup.pruneReadNotifications,
  {},
);

export default crons;
