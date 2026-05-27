"use client";

import { Info, Mail, Calendar, ShieldCheck, Hash, UserRound } from "lucide-react";
import { Card } from "@/components/ui";
import { formatArabicDate } from "@smart-zuj/core";
import type { Doc } from "@smart-zuj/convex";

const ROLE_LABEL: Record<string, string> = {
  student: "طالب",
  supervisor: "مشرف أكاديمي",
  admin: "مدير النظام",
  sponsor: "داعم",
};

interface AccountInfoCardProps {
  user: Doc<"users"> | null | undefined;
}

/**
 * Read-only summary of the user's account metadata. Lives alongside the
 * editable profile card so the student sees, in one place, the data we
 * have on file (email, university id, role, joined date, account
 * status) without making any of it accidentally editable.
 */
export function AccountInfoCard({ user }: AccountInfoCardProps) {
  if (!user) return null;
  const role = user.role ? ROLE_LABEL[user.role] ?? user.role : "—";
  const isStudent = user.role === "student";

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Info className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-base">معلومات الحساب</h3>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">
            بيانات الحساب الأساسية، للقراءة فقط.
          </p>
        </div>
      </div>

      <dl className="space-y-3 text-sm">
        <InfoRow
          icon={<Mail className="w-3.5 h-3.5" />}
          label="البريد الإلكتروني"
          value={
            <span dir="ltr" className="font-mono text-xs">
              {user.email ?? "—"}
            </span>
          }
        />

        {isStudent && user.studentId && (
          <InfoRow
            icon={<Hash className="w-3.5 h-3.5" />}
            label="الرقم الجامعي"
            value={
              <span dir="ltr" className="font-mono">
                {user.studentId}
              </span>
            }
          />
        )}

        <InfoRow
          icon={<UserRound className="w-3.5 h-3.5" />}
          label="الدور"
          value={role}
        />

        {typeof user.createdAt === "number" && (
          <InfoRow
            icon={<Calendar className="w-3.5 h-3.5" />}
            label="تاريخ الانضمام"
            value={formatArabicDate(user.createdAt)}
          />
        )}

        <InfoRow
          icon={<ShieldCheck className="w-3.5 h-3.5" />}
          label="حالة الحساب"
          value={
            user.isActive ? (
              <span className="inline-flex items-center gap-1.5 text-success font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-success" />
                نشط
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-destructive font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                موقوف
              </span>
            )
          }
        />
      </dl>
    </Card>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground shrink-0">
        {icon}
        {label}
      </dt>
      <dd className="font-bold text-sm text-foreground/90 truncate min-w-0">
        {value}
      </dd>
    </div>
  );
}
