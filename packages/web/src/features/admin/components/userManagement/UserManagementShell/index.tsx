"use client";

import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { Plus, X, CheckCircle2, Trash2 } from "lucide-react";
import { api } from "@smart-zuj/convex";
import type { Id } from "@smart-zuj/convex";
import { Button } from "@/components/ui";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { toast } from "@/lib/toast";
import { getConvexErrorMessage } from "@/lib/errors";
import ProfileModal, { type UserItem } from "../ProfileModal";
import EditUserModal from "../EditUserModal";
import type { UserManagementConfig } from "../config";
import { CreateUserForm } from "./CreateUserForm";
import { SearchFilter } from "./SearchFilter";
import { UsersTable } from "./UsersTable";

/**
 * Rendering shell for the per-role admin user-management pages. Both
 * `SupervisorManagement` and `SponsorManagement` are thin wrappers that
 * pass a config — keep all UI here.
 */
export default function UserManagementShell({ config }: { config: UserManagementConfig }) {
  const { role } = config;
  const PageIcon = config.pageIcon;

  const users = useQuery(api.users.admin.getAllUsers, { role });
  const currentUser = useQuery(api.users.shared.currentUser);
  const createUser = useMutation(api.users.admin.createUserByAdmin);
  const createSupervisor = useAction(api.users.adminActions.createSupervisor);
  const createSponsor = useAction(api.users.adminActions.createSponsor);
  const toggleActive = useMutation(api.users.admin.toggleUserActive);
  const deleteUser = useAction(api.users.adminActions.deleteUserByAdmin);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", department: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [profileUser, setProfileUser] = useState<UserItem | null>(null);
  const [editUser, setEditUser] = useState<UserItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = (users ?? []).filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (u.name ?? "").toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!formData.name.trim() || !formData.email.trim()) {
      setError("الاسم والبريد الإلكتروني حقلان إلزاميان.");
      return;
    }
    if (config.showPasswordField && !formData.password) {
      setError("كلمة المرور حقل إلزامي.");
      return;
    }
    if (role === "sponsor") {
      if (!formData.phone.trim()) {
        setError("رقم الهاتف حقل إلزامي.");
        return;
      }
      if (!/^07\d{8}$/.test(formData.phone.trim())) {
        setError("يجب أن يتكون رقم الهاتف من عشرة أرقام وأن يبدأ بـ 07.");
        return;
      }
    }
    setLoading(true);
    try {
      if (role === "supervisor") {
        await createSupervisor({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          department: formData.department || undefined,
          phone: formData.phone || undefined,
        });
      } else {
        await createSponsor({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone || undefined,
        });
      }
      setSuccess(config.successMessage);
      setFormData({ name: "", email: "", department: "", phone: "", password: "" });
      setShowForm(false);
      toast.success(config.successMessage);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "حدث خطأ أثناء تنفيذ العملية.");
    } finally {
      setLoading(false);
    }
  };

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
      toast.success("تم حذف الحساب نهائيًا");
      setDeleteTarget(null);
    } catch (e: unknown) {
      toast.error(getConvexErrorMessage(e, "تعذّر حذف الحساب، يُرجى المحاولة مجددًا."));
    } finally {
      setDeleting(false);
    }
  };

  // Reference unused mutation so it stays in the dependency graph if a
  // future config sets hideAddForm + showPasswordField=false.
  void createUser;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold flex items-center gap-2 mb-1">
            <PageIcon className="w-6 h-6" style={{ color: config.color.primary }} />
            {config.pageTitle}
          </h2>
          <p className="text-sm text-muted-foreground font-medium">
            {users ? config.countLabel(users.length) : "يجري التحميل..."}
          </p>
        </div>
        {!config.hideAddForm && (
          <Button
            onPress={() => { setShowForm(!showForm); setError(""); setSuccess(""); }}
            variant="primary"
            style={{ background: config.color.primary, color: config.color.textOnPrimary, borderColor: config.color.border }}
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? "إلغاء" : config.addButtonLabel}
          </Button>
        )}
      </div>

      {success && (
        <div className="flex items-center gap-2 p-3 bg-success/10 ds-border rounded-lg border-success">
          <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
          <p className="text-sm font-semibold text-success">{success}</p>
        </div>
      )}

      {/* Create Form */}
      {!config.hideAddForm && showForm && (
        <CreateUserForm
          config={config}
          formData={formData}
          setFormData={setFormData}
          loading={loading}
          error={error}
          onSubmit={handleCreate}
        />
      )}

      {/* Filters */}
      <SearchFilter search={search} setSearch={setSearch} />

      {/* Users Table */}
      <UsersTable
        config={config}
        users={users}
        filtered={filtered}
        search={search}
        setProfileUser={setProfileUser}
        handleToggle={handleToggle}
        onEdit={setEditUser}
        onDelete={setDeleteTarget}
        currentUserId={currentUser?._id}
      />

      {profileUser && (
        <ProfileModal user={profileUser} config={config} onClose={() => setProfileUser(null)} />
      )}

      {editUser && (
        <EditUserModal
          user={editUser}
          showDepartment={config.showDepartment}
          onClose={() => setEditUser(null)}
        />
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open && !deleting) setDeleteTarget(null);
        }}
        title="حذف الحساب نهائيًا"
        description={`سيتم حذف حساب "${deleteTarget?.name ?? deleteTarget?.email ?? ""}" وكل بياناته نهائيًا، ولا يمكن التراجع. هل أنت متأكد؟`}
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
