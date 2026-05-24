import type { QueryCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";

export async function loadUsersMap(
  ctx: QueryCtx,
  ids: readonly (Id<"users"> | undefined | null)[],
): Promise<Map<Id<"users">, Doc<"users">>> {
  const uniqueIds = Array.from(
    new Set(ids.filter((id): id is Id<"users"> => id != null)),
  );
  const users = await Promise.all(uniqueIds.map((id) => ctx.db.get(id)));
  const map = new Map<Id<"users">, Doc<"users">>();
  uniqueIds.forEach((id, i) => {
    const u = users[i];
    if (u) map.set(id, u);
  });
  return map;
}

export async function loadStudentsMap(
  ctx: QueryCtx,
  apps: readonly Doc<"applications">[],
): Promise<Map<Id<"users">, Doc<"users">>> {
  return loadUsersMap(ctx, apps.map((a) => a.studentId));
}
