"use client";

import {
  Mail,
  Phone,
  GraduationCap,
  BookOpen,
  IdCard,
  Link2,
} from "lucide-react";
import InfoRow from "./InfoRow";

/**
 * Shape returned by both `users.admin.getStudentByApplication` and
 * `applications.sponsor.getStudentForAcceptedApplication` — kept in sync so
 * the same body can render either.
 */
export interface StudentProfileBodyData {
  name: string | null;
  email: string;
  studentId: string | null;
  college: string | null;
  department: string | null;
  phone: string | null;
  linkedinUrl: string | null;
  avatarUrl: string | null;
}

/** Reusable applicant profile body — used inside dialogs by supervisors and sponsors. */
export default function StudentProfileBody({
  student,
}: {
  student: StudentProfileBodyData;
}) {
  const initial = student.name?.charAt(0) ?? "؟";
  const hasDetails =
    !!student.studentId ||
    !!student.phone ||
    !!student.college ||
    !!student.department ||
    !!student.linkedinUrl;

  return (
    <div className="space-y-4">
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
