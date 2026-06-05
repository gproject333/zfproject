"use client";

import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { Trash2 } from "lucide-react";
import { api } from "@smart-zuj/convex";
import { Id } from "@smart-zuj/convex";
import { toast } from "@/lib/toast";
import { getConvexErrorMessage } from "@/lib/errors";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EditUserModal from "../userManagement/EditUserModal";
import { Filters } from "./Filters";
import { StudentsTable } from "./StudentsTable";
import { ProfileModal } from "./ProfileModal";
import type { StudentProfile } from "./types";

export default function StudentManagement() {
  const [search, setSearch] = useState("");
  const [selectedCollege, setSelectedCollege] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [profileStudent, setProfileStudent] = useState<StudentProfile | null>(null);
  const [editStudent, setEditStudent] = useState<StudentProfile | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StudentProfile | null>(null);
  const [deleting, setDeleting] = useState(false);

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
  const deleteUser = useAction(api.users.adminActions.deleteUserByAdmin);

  const handleToggle = async (id: Id<"users">, isActive: boolean) => {
    try {
      await toggleActive({ userId: id, isActive });
      toast.success(isActive ? "تم تفعيل الحساب" : "تم تجميد الحساب");
    } catch (e: unknown) {
      toast.error(getConvexErrorMessage(e, "حدث خطأ أثناء تنفيذ العملية"));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteUser({ userId: deleteTarget._id });
      toast.success("تم حذف الطالب وكل بياناته نهائيًا");
      setDeleteTarget(null);
    } catch (e: unknown) {
      toast.error(getConvexErrorMessage(e, "تعذّر حذف الطالب، يُرجى المحاولة مجددًا."));
    } finally {
      setDeleting(false);
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
        onEdit={setEditStudent}
        onDelete={setDeleteTarget}
      />

      {/* Profile Modal */}
      {profileStudent && (
        <ProfileModal
          profileStudent={profileStudent}
          setProfileStudent={setProfileStudent}
        />
      )}

      {editStudent && (
        <EditUserModal
          user={editStudent}
          showDepartment
          onClose={() => setEditStudent(null)}
        />
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open && !deleting) setDeleteTarget(null);
        }}
        title="حذف الطالب نهائيًا"
        description={`سيتم حذف الطالب "${deleteTarget?.name ?? deleteTarget?.email ?? ""}" وكل طلباته وبياناته نهائيًا، ولا يمكن التراجع. هل أنت متأكد؟`}
        icon={<Trash2 className="w-6 h-6 text-destructive" />}
        destructive
        confirmLabel="نعم، حذف نهائي"
        cancelLabel="إلغاء"
        isSubmitting={deleting}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
