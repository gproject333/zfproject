"use client";

import { ToggleLeft, ToggleRight, User, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui";
import { Id } from "@smart-zuj/convex";
import type { StudentProfile } from "./types";

interface StudentsTableProps {
  students: StudentProfile[] | undefined;
  setProfileStudent: (s: StudentProfile) => void;
  handleToggle: (id: Id<"users">, isActive: boolean) => void;
  onEdit: (s: StudentProfile) => void;
  onDelete: (s: StudentProfile) => void;
}

export function StudentsTable({ students, setProfileStudent, handleToggle, onEdit, onDelete }: StudentsTableProps) {
  return (
    <Card className="overflow-hidden">
      {students === undefined ? (
        <div className="p-8 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : students.length === 0 ? (
        <div className="p-12 text-center">
          <p className="text-muted-foreground font-medium">لا يوجد طلاب مطابقون لمعايير البحث</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-right px-4 py-3 font-extrabold">الطالب</th>
                <th className="text-right px-4 py-3 font-extrabold hidden md:table-cell">الكلية</th>
                <th className="text-right px-4 py-3 font-extrabold hidden lg:table-cell">التخصص</th>
                <th className="text-right px-4 py-3 font-extrabold hidden sm:table-cell">المشاريع</th>
                <th className="text-right px-4 py-3 font-extrabold">الحالة</th>
                <th className="text-right px-4 py-3 font-extrabold">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student._id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-info/20 ds-border flex items-center justify-center shrink-0 font-extrabold text-info text-sm">
                        {(student.name ?? student.email)[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold truncate">{student.name ?? "—"}</p>
                        <p className="text-xs text-muted-foreground truncate">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                    {student.college ?? "—"}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
                    {student.department ?? "—"}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="ds-badge bg-primary/10 text-primary font-bold">
                      {student.applicationCount} مشروع
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`ds-badge font-bold ${
                        student.isActive
                          ? "bg-success/10 text-success"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {student.isActive ? "فعّال" : "مجمّد"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        onClick={() => setProfileStudent(student)}
                        className="hover:bg-foreground/5 rounded transition-colors text-xs flex items-center gap-1 px-2 py-1"
                      >
                        <User className="w-3.5 h-3.5" />
                        الملف
                      </button>
                      <button
                        onClick={() => onEdit(student)}
                        className="hover:bg-foreground/5 rounded transition-colors text-xs flex items-center gap-1 px-2 py-1"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        تعديل
                      </button>
                      <button
                        onClick={() => handleToggle(student._id, !student.isActive)}
                        className="hover:bg-foreground/5 rounded transition-colors text-xs flex items-center gap-1 px-2 py-1"
                      >
                        {student.isActive ? (
                          <ToggleRight className="w-4 h-4 text-success" />
                        ) : (
                          <ToggleLeft className="w-4 h-4 text-muted-foreground" />
                        )}
                        {student.isActive ? "تجميد" : "تفعيل"}
                      </button>
                      <button
                        onClick={() => onDelete(student)}
                        className="hover:bg-destructive/10 text-destructive rounded transition-colors text-xs flex items-center gap-1 px-2 py-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        حذف
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
