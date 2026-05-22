"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import {
  User as UserIcon,
  Mail,
  Phone,
  GraduationCap,
  BookOpen,
  IdCard,
  Link2,
  ChevronLeft,
} from "lucide-react";
import type { FunctionReturnType } from "convex/server";
import { Spinner } from "@/components/ui";
import { Dialog, DialogContent } from "@/components/ui/Dialog";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import InfoRow from "@/features/applications/components/InfoRow";

interface StudentProfileButtonProps {
  applicationId: Id<"applications">;
}

/**
 * Replaces the inline applicant card on the supervisor review page: a
 * single row-button that opens the full applicant profile in a dialog,
 * keeping the review surface focused on the application itself.
 */
export default function StudentProfileButton({
  applicationId,
}: StudentProfileButtonProps) {
  const [open, setOpen] = useState(false);
  const student = useQuery(api.users.admin.getStudentByApplication, {
    applicationId,
  });

  // No applicant on record — nothing to open.
  if (student === null) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="ds-card-interactive w-full p-4 flex items-center gap-3 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <span className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <UserIcon className="w-5 h-5" />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block font-bold text-sm">عرض ملف مقدّم الطلب</span>
          <span className="block text-xs text-muted-foreground">
            البيانات الشخصية والأكاديمية لصاحب الطلب
          </span>
        </span>
        <ChevronLeft className="w-5 h-5 text-muted-foreground shrink-0" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent title="ملف مقدّم الطلب" className="max-w-md">
          {student === undefined ? (
            <div className="flex items-center justify-center min-h-[180px]">
              <Spinner size="sm" color="current" className="text-accent" />
            </div>
          ) : (
            <StudentProfileBody student={student} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

type Student = NonNullable<
  FunctionReturnType<typeof api.users.admin.getStudentByApplication>
>;

/** Profile detail body rendered inside the dialog. */
function StudentProfileBody({ student }: { student: Student }) {
  const initial = student.name?.charAt(0) ?? "؟";
  const hasDetails =
    !!student.studentId ||
    !!student.phone ||
    !!student.college ||
    !!student.department ||
    !!student.linkedinUrl;

  return (
    <div className="space-y-4">
      {/* Avatar + name + email */}
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 rounded-full ds-border overflow-hidden bg-muted shrink-0 flex items-center justify-center ds-shadow-sm">
          {student.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={student.avatarUrl}
              alt={student.name ?? "الصورة الشخصية"}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-2xl font-black text-muted-foreground">
              {initial}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-extrabold text-base truncate">
            {student.name ?? "—"}
          </p>
          {student.email && (
            <a
              href={`mailto:${student.email}`}
              className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5 hover:text-accent hover:underline break-all mt-0.5"
              dir="ltr"
            >
              <Mail className="w-3.5 h-3.5 shrink-0" />
              {student.email}
            </a>
          )}
        </div>
      </div>

      {hasDetails && (
        <dl className="space-y-3 border-t border-foreground/[0.07] pt-4">
          {student.studentId && (
            <InfoRow
              icon={<IdCard className="w-4 h-4" />}
              label="الرقم الجامعي"
              value={<span dir="ltr">{student.studentId}</span>}
            />
          )}
          {student.phone && (
            <InfoRow
              icon={<Phone className="w-4 h-4" />}
              label="رقم الهاتف"
              value={
                <a
                  href={`tel:${student.phone}`}
                  className="hover:text-accent hover:underline"
                  dir="ltr"
                >
                  {student.phone}
                </a>
              }
            />
          )}
          {student.college && (
            <InfoRow
              icon={<GraduationCap className="w-4 h-4" />}
              label="الكلية"
              value={student.college}
            />
          )}
          {student.department && (
            <InfoRow
              icon={<BookOpen className="w-4 h-4" />}
              label="التخصص"
              value={student.department}
            />
          )}
          {student.linkedinUrl && (
            <InfoRow
              icon={<Link2 className="w-4 h-4" />}
              label="LinkedIn"
              value={
                <a
                  href={student.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline break-all"
                  dir="ltr"
                >
                  {student.linkedinUrl}
                </a>
              }
            />
          )}
        </dl>
      )}
    </div>
  );
}
