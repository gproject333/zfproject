"use client";

import { X } from "lucide-react";
import { Card } from "@/components/ui";
import type { Id } from "../../../../../convex/_generated/dataModel";
import type { UserManagementConfig } from "./config";

export interface UserItem {
  _id: Id<"users">;
  name?: string | null;
  email: string;
  department?: string | null;
  phone?: string | null;
  isActive?: boolean | null;
}

export default function ProfileModal({
  user,
  config,
  onClose,
}: {
  user: UserItem;
  config: UserManagementConfig;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <Card className="p-6 w-full max-w-sm space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-lg">الملف الشخصي</h3>
          <button onClick={onClose} className="hover:bg-foreground/5 rounded transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl ds-border flex items-center justify-center font-extrabold text-2xl"
            style={{ background: config.color.primary, color: config.color.textOnPrimary }}
          >
            {user.name?.charAt(0) ?? config.fallbackInitial}
          </div>
          <div>
            <p className="font-extrabold text-lg">{user.name ?? "—"}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          {config.showDepartment && (
            <div className="flex justify-between py-1.5 border-b border-border/40">
              <span className="text-muted-foreground">التخصص</span>
              <span className="font-semibold">{user.department ?? "—"}</span>
            </div>
          )}
          <div className="flex justify-between py-1.5 border-b border-border/40">
            <span className="text-muted-foreground">الهاتف</span>
            <span className="font-semibold" dir="ltr">{user.phone ?? "—"}</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-muted-foreground">الحالة</span>
            <span className={`font-bold ${user.isActive !== false ? "text-success" : "text-destructive"}`}>
              {user.isActive !== false ? "فعّال" : "مجمّد"}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
