"use client";

import { useQuery } from "convex/react";
import {User as UserIcon, Mail, Phone, GraduationCap, BookOpen, IdCard, Link2} from "lucide-react";
import { Spinner, Card} from "@/components/ui";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import InfoRow from "@/features/applications/components/InfoRow";

interface StudentProfileCardProps {
  applicationId: Id<"applications">;
}

/**
 * Sidebar profile card for the supervisor review page. Uses the
 * project's nb-card / nb-border / nb-badge utilities + the primary/
 * accent color tokens.
 */
export default function StudentProfileCard({ applicationId }: StudentProfileCardProps) {
  const student = useQuery(api.users.admin.getStudentByApplication, {
    applicationId,
  });

  if (student === undefined) {
    return (
      <Card className="p-5 flex items-center justify-center min-h-[160px]">
        <Spinner size="sm" color="current" className="text-accent" />
      </Card>
    );
  }

  if (student === null) return null;

  const initial = student.name?.charAt(0) ?? "?";

  return (
    <Card className="p-5">
      <h3 className="font-bold text-base mb-4 flex items-center gap-2">
        <UserIcon className="w-5 h-5 text-primary" />
        بيانات مقدّم الطلب
      </h3>

      {/* Avatar + name */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-14 h-14 rounded-full nb-border overflow-hidden bg-muted shrink-0 flex items-center justify-center nb-shadow-sm">
          {student.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={student.avatarUrl}
              alt={student.name ?? "الصورة الشخصية"}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xl font-black text-muted-foreground">{initial}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-extrabold text-base truncate">{student.name ?? "—"}</p>
          <a
            href={`mailto:${student.email}`}
            className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5 hover:text-accent hover:underline break-all"
            dir="ltr"
          >
            <Mail className="w-3.5 h-3.5 shrink-0" />
            {student.email}
          </a>
        </div>
      </div>

      <dl className="space-y-3">
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
    </Card>
  );
}

