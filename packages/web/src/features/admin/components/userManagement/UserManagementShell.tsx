"use client";

import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { Plus, X, Mail, User, Building, Phone, KeyRound, CheckCircle2, AlertCircle, ToggleLeft, ToggleRight, Search } from "lucide-react";
import { api } from "@smart-zuj/convex";
import type { Id } from "@smart-zuj/convex";
import { Button, Input, Spinner, Card } from "@/components/ui";
import { toast } from "@/lib/toast";
import ProfileModal, { type UserItem } from "./ProfileModal";
import type { UserManagementConfig } from "./config";

/**
 * Rendering shell for the per-role admin user-management pages. Both
 * `SupervisorManagement` and `SponsorManagement` are thin wrappers that
 * pass a config — keep all UI here.
 */
export default function UserManagementShell({ config }: { config: UserManagementConfig }) {
  const { role } = config;
  const PageIcon = config.pageIcon;
  const FormIcon = config.formIcon;

  const users = useQuery(api.users.admin.getAllUsers, { role });
  const createUser = useMutation(api.users.admin.createUserByAdmin);
  const createSupervisor = useAction(api.users.adminActions.createSupervisor);
  const createSponsor = useAction(api.users.adminActions.createSponsor);
  const toggleActive = useMutation(api.users.admin.toggleUserActive);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", department: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [profileUser, setProfileUser] = useState<UserItem | null>(null);

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
      setError("الاسم والبريد الإلكتروني مطلوبان");
      return;
    }
    if (config.showPasswordField && !formData.password) {
      setError("كلمة المرور مطلوبة");
      return;
    }
    if (role === "sponsor") {
      if (!formData.phone.trim()) {
        setError("رقم الهاتف مطلوب");
        return;
      }
      if (!/^07\d{8}$/.test(formData.phone.trim())) {
        setError("رقم الهاتف يجب أن يكون 10 أرقام ويبدأ بـ 07");
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
      setError(e instanceof Error ? e.message : "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: Id<"users">, isActive: boolean) => {
    try {
      await toggleActive({ userId: id, isActive });
      toast.success(isActive ? "تم تفعيل الحساب" : "تم تجميد الحساب");
    } catch {
      toast.error("حدث خطأ");
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
            {users ? config.countLabel(users.length) : "جاري التحميل..."}
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
        <Card className="p-6 border-[3px] animate-slide-up" style={{ borderColor: config.color.primary }}>
          <h3 className="font-extrabold text-lg mb-4 flex items-center gap-2">
            <FormIcon className="w-5 h-5" style={{ color: config.color.primary }} />
            {config.formTitle}
          </h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {error && (
              <div className="md:col-span-2 flex items-center gap-2 p-3 bg-destructive/10 ds-border rounded-lg border-destructive">
                <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
                <p className="text-sm font-semibold text-destructive">{error}</p>
              </div>
            )}
            <div className="space-y-1">
              <label className="block text-sm font-bold">{config.nameField.label}</label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input fullWidth className="pr-10" placeholder={config.nameField.placeholder} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-bold">البريد الإلكتروني *</label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input fullWidth className="pr-10" type="email" placeholder={config.emailPlaceholder} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} dir="ltr" style={{ textAlign: "left" }} required />
              </div>
            </div>
            {config.showDepartment && (
              <div className="space-y-1">
                <label className="block text-sm font-bold">القسم / التخصص</label>
                <div className="relative">
                  <Building className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input fullWidth className="pr-10" placeholder="هندسة البرمجيات" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} />
                </div>
              </div>
            )}
            {config.showPasswordField && (
              <div className="space-y-1">
                <label className="block text-sm font-bold">كلمة المرور *</label>
                <div className="relative">
                  <KeyRound className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    fullWidth
                    className="pr-10"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    dir="ltr"
                    style={{ textAlign: "left" }}
                    required
                  />
                </div>
              </div>
            )}
            <div className="space-y-1">
              <label className="block text-sm font-bold">{config.phoneLabel}</label>
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input fullWidth className="pr-10" placeholder={config.phonePlaceholder} value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} dir="ltr" style={{ textAlign: "left" }} />
              </div>
            </div>
            <div className="md:col-span-2">
              <div className={`p-3 rounded-lg ${config.formHint.bg} ds-border ${config.formHint.border} text-sm font-medium ${config.formHint.color} mb-4`}>
                {config.formHint.text}
              </div>
              <Button type="submit" isDisabled={loading} variant="primary" className="w-full md:w-auto" style={{ background: config.color.primary, color: config.color.textOnPrimary, borderColor: config.color.border }}>
                {loading ? <Spinner size="sm" color="current" /> : <Plus className="w-4 h-4" />}
                {loading ? "جاري الإنشاء..." : "إنشاء الحساب"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Filters */}
      <Card className="p-3 sm:p-4">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالاسم أو البريد..."
            fullWidth
            className="px-9 text-sm"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="مسح البحث"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </Card>

      {/* Users Table */}
      <Card className="overflow-hidden">
        {users === undefined ? (
          <div className="p-8 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <PageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-extrabold text-lg mb-1">
              {search ? "لا توجد نتائج مطابقة" : config.emptyTitle}
            </h3>
            <p className="text-sm text-muted-foreground">
              {search ? "جرّب تعديل كلمة البحث" : config.emptyDescription}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-right px-4 py-3 font-extrabold">
                    {role === "supervisor" ? "المشرف" : "الداعم"}
                  </th>
                  {config.showDepartment && (
                    <th className="text-right px-4 py-3 font-extrabold hidden md:table-cell">التخصص</th>
                  )}
                  <th className="text-right px-4 py-3 font-extrabold hidden sm:table-cell">الهاتف</th>
                  <th className="text-right px-4 py-3 font-extrabold">الحالة</th>
                  <th className="text-right px-4 py-3 font-extrabold">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user._id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl ds-border flex items-center justify-center shrink-0 font-extrabold text-sm"
                          style={{ background: config.color.primary, color: config.color.textOnPrimary }}
                        >
                          {user.name?.charAt(0) ?? config.fallbackInitial}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold truncate">{user.name ?? "—"}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    {config.showDepartment && (
                      <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                        {user.department ?? "—"}
                      </td>
                    )}
                    <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">
                      <span dir="ltr">{user.phone ?? "—"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`ds-badge font-bold ${
                          user.isActive !== false
                            ? "bg-success/10 text-success"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {user.isActive !== false ? "فعّال" : "مجمّد"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setProfileUser(user)}
                          className="hover:bg-foreground/5 rounded transition-colors text-xs flex items-center gap-1 px-2 py-1"
                        >
                          <User className="w-3.5 h-3.5" />
                          الملف
                        </button>
                        <button
                          onClick={() => handleToggle(user._id, user.isActive === false)}
                          className="hover:bg-foreground/5 rounded transition-colors text-xs flex items-center gap-1 px-2 py-1"
                        >
                          {user.isActive !== false ? (
                            <ToggleRight className="w-4 h-4 text-success" />
                          ) : (
                            <ToggleLeft className="w-4 h-4 text-muted-foreground" />
                          )}
                          {user.isActive !== false ? "تجميد" : "تفعيل"}
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

      {profileUser && (
        <ProfileModal user={profileUser} config={config} onClose={() => setProfileUser(null)} />
      )}
    </div>
  );
}
