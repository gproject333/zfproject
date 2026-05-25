"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@smart-zuj/convex";
import { Id } from "@smart-zuj/convex";
import { toast } from "@/lib/toast";
import { Filters } from "./Filters";
import { StudentsTable } from "./StudentsTable";
import { ProfileModal } from "./ProfileModal";
import type { StudentProfile } from "./types";

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
      toast.error("حدث خطأ أثناء تنفيذ العملية");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-extrabold mb-1">إدارة الطلاب</h2>
        <p className="text-muted-foreground font-medium">عرض بيانات الطلاب المسجَّلين وإدارة حساباتهم</p>
      </div>

      {/* Filters */}
      <Filters
        search={search}
        setSearch={setSearch}
        selectedCollege={selectedCollege}
        setSelectedCollege={setSelectedCollege}
        selectedDepartment={selectedDepartment}
        setSelectedDepartment={setSelectedDepartment}
        colleges={colleges}
        departments={departments}
      />

      {/* Table */}
      <StudentsTable
        students={students}
        setProfileStudent={setProfileStudent}
        handleToggle={handleToggle}
      />

      {/* Profile Modal */}
      {profileStudent && (
        <ProfileModal
          profileStudent={profileStudent}
          setProfileStudent={setProfileStudent}
        />
      )}
    </div>
  );
}
