"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import {
  Search,
  ToggleLeft,
  ToggleRight,
  User,
  ChevronDown,
  X,
} from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { toast } from "sonner";
import { Input } from "@/components/ui";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select";

interface StudentProfile {
  _id: Id<"users">;
  name: string | null;
  email: string;
  studentId: string | null;
  college: string | null;
  department: string | null;
  phone: string | null;
  linkedinUrl: string | null;
  isActive: boolean;
  createdAt: number | null;
  applicationCount: number;
}

export default function StudentManagement() {
  const [search, setSearch] = useState("");
  const [selectedCollege, setSelectedCollege] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [profileStudent, setProfileStudent] = useState<StudentProfile | null>(null);

  const colleges = useQuery(api.colleges.list, {});
  const departments = useQuery(
    api.colleges.getDepartmentsByCollege,
    selectedCollege && colleges
      ? { collegeId: colleges.find((c) => c.name === selectedCollege)?._id as Id<"colleges"> }
      : "skip",
  );

  const students = useQuery(api.users.admin.getStudentsWithStats, {
    search: search || undefined,
    college: selectedCollege || undefined,
    department: selectedDepartment || undefined,
  });
  const toggleActive = useMutation(api.users.admin.toggleUserActive);

  const handleToggle = async (id: Id<"users">, isActive: boolean) => {
    try {
      await toggleActive({ userId: id, isActive });
      toast.success(isActive ? "تم تفعيل الحساب" : "تم تجميد الحساب");
    } catch {
      toast.error("حدث خطأ");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-extrabold mb-1">إدارة الطلاب</h2>
        <p className="text-muted-foreground font-medium">عرض بيانات الطلاب المسجلين وإدارة حساباتهم</p>
      </div>

      {/* Filters */}
      <div className="nb-card p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالاسم أو البريد..."
            fullWidth
            className="pr-9 text-sm"
          />
        </div>

        <div className="min-w-40">
          <Select
            value={selectedCollege || "all"}
            onValueChange={(v) => {
              setSelectedCollege(v === "all" ? "" : v);
              setSelectedDepartment("");
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الكليات</SelectItem>
              {colleges?.map((c) => (
                <SelectItem key={c._id} value={c.name}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-40">
          <Select
            value={selectedDepartment || "all"}
            onValueChange={(v) => setSelectedDepartment(v === "all" ? "" : v)}
            isDisabled={!selectedCollege}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل التخصصات</SelectItem>
              {departments?.map((d) => (
                <SelectItem key={d._id} value={d.name}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {(search || selectedCollege || selectedDepartment) && (
          <button
            onClick={() => { setSearch(""); setSelectedCollege(""); setSelectedDepartment(""); }}
            className="hover:bg-foreground/5 rounded transition-colors text-sm flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            مسح
          </button>
        )}
      </div>

      {/* Table */}
      <div className="nb-card overflow-hidden">
        {students === undefined ? (
          <div className="p-8 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground font-medium">لا يوجد طلاب مطابقون للبحث</p>
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
                        <div className="w-9 h-9 rounded-xl bg-info/20 nb-border flex items-center justify-center shrink-0 font-extrabold text-info text-sm">
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
                      <span className="nb-badge bg-primary/10 text-primary font-bold">
                        {student.applicationCount} مشروع
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`nb-badge font-bold ${
                          student.isActive
                            ? "bg-success/10 text-success"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {student.isActive ? "فعّال" : "مجمّد"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setProfileStudent(student)}
                          className="hover:bg-foreground/5 rounded transition-colors text-xs flex items-center gap-1 px-2 py-1"
                        >
                          <User className="w-3.5 h-3.5" />
                          الملف
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
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Profile Modal */}
      {profileStudent && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setProfileStudent(null)}
        >
          <div
            className="nb-card p-6 w-full max-w-md space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-lg">الملف الشخصي</h3>
              <button onClick={() => setProfileStudent(null)} className="hover:bg-foreground/5 rounded transition-colors p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-info/20 nb-border flex items-center justify-center font-extrabold text-info text-2xl">
                {(profileStudent.name ?? profileStudent.email)[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-extrabold text-lg">{profileStudent.name ?? "—"}</p>
                <p className="text-sm text-muted-foreground">{profileStudent.email}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <ProfileRow label="الرقم الجامعي" value={profileStudent.studentId} />
              <ProfileRow label="الكلية" value={profileStudent.college} />
              <ProfileRow label="التخصص" value={profileStudent.department} />
              <ProfileRow label="الهاتف" value={profileStudent.phone} />
              <ProfileRow label="LinkedIn" value={profileStudent.linkedinUrl} />
              <ProfileRow label="المشاريع المقدمة" value={String(profileStudent.applicationCount)} />
              <ProfileRow
                label="الحالة"
                value={profileStudent.isActive ? "فعّال" : "مجمّد"}
                valueClass={profileStudent.isActive ? "text-success font-bold" : "text-destructive font-bold"}
              />
              {profileStudent.createdAt && (
                <ProfileRow
                  label="تاريخ التسجيل"
                  value={new Date(profileStudent.createdAt).toLocaleDateString("ar-JO")}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileRow({
  label,
  value,
  valueClass = "",
}: {
  label: string;
  value?: string | null;
  valueClass?: string;
}) {
  return (
    <div className="flex justify-between gap-2 py-1.5 border-b border-border/40 last:border-0">
      <span className="text-muted-foreground font-medium">{label}</span>
      <span className={`font-semibold text-left ${valueClass}`}>{value ?? "—"}</span>
    </div>
  );
}
