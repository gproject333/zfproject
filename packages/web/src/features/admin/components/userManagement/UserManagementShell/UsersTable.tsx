"use client";

import { User, ToggleLeft, ToggleRight } from "lucide-react";
import { Card } from "@/components/ui";
import type { Id } from "@smart-zuj/convex";
import type { UserItem } from "../ProfileModal";
import type { UserManagementConfig } from "../config";

interface UsersTableProps {
  config: UserManagementConfig;
  users: UserItem[] | undefined;
  filtered: UserItem[];
  search: string;
  setProfileUser: (u: UserItem) => void;
  handleToggle: (id: Id<"users">, isActive: boolean) => void;
}

export function UsersTable({ config, users, filtered, search, setProfileUser, handleToggle }: UsersTableProps) {
  const { role } = config;
  const PageIcon = config.pageIcon;
  return (
    <Card className="overflow-hidden">
      {users === undefined ? (
        <div className="p-8 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center">
          <PageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-extrabold text-lg mb-1">
            {search ? "لا توجد نتائج مطابقة" : config.emptyTitle}
          </h3>
          <p className="text-sm text-muted-foreground">
            {search ? "يُرجى تعديل كلمة البحث." : config.emptyDescription}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-right px-4 py-3 font-extrabold">
                  {role === "supervisor" ? "المشرف" : "الداعم"}
                </th>
                {config.showDepartment && (
                  <th className="text-right px-4 py-3 font-extrabold hidden md:table-cell">التخصص</th>
                )}
                <th className="text-right px-4 py-3 font-extrabold hidden sm:table-cell">الهاتف</th>
                <th className="text-right px-4 py-3 font-extrabold">الحالة</th>
                <th className="text-right px-4 py-3 font-extrabold">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user._id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-xl ds-border flex items-center justify-center shrink-0 font-extrabold text-sm"
                        style={{ background: config.color.primary, color: config.color.textOnPrimary }}
                      >
                        {user.name?.charAt(0) ?? config.fallbackInitial}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold truncate">{user.name ?? "—"}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  {config.showDepartment && (
                    <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                      {user.department ?? "—"}
                    </td>
                  )}
                  <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">
                    <span dir="ltr">{user.phone ?? "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`ds-badge font-bold ${
                        user.isActive !== false
                          ? "bg-success/10 text-success"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {user.isActive !== false ? "فعّال" : "مجمّد"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setProfileUser(user)}
                        className="hover:bg-foreground/5 rounded transition-colors text-xs flex items-center gap-1 px-2 py-1"
                      >
                        <User className="w-3.5 h-3.5" />
                        الملف
                      </button>
                      <button
                        onClick={() => handleToggle(user._id, user.isActive === false)}
                        className="hover:bg-foreground/5 rounded transition-colors text-xs flex items-center gap-1 px-2 py-1"
                      >
                        {user.isActive !== false ? (
                          <ToggleRight className="w-4 h-4 text-success" />
                        ) : (
                          <ToggleLeft className="w-4 h-4 text-muted-foreground" />
                        )}
                        {user.isActive !== false ? "تجميد" : "تفعيل"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
