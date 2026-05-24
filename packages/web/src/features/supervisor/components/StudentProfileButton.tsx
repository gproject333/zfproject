"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { User as UserIcon, ChevronLeft } from "lucide-react";
import { Spinner } from "@/components/ui";
import { Dialog, DialogContent } from "@/components/ui/Dialog";
import { api } from "@smart-zuj/convex";
import type { Id } from "@smart-zuj/convex";
import StudentProfileBody from "@/features/applications/components/StudentProfileBody";

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
