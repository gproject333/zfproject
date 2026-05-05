"use client";

import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import {Users, Building2, Plus, X, Mail, User, Building, Phone, KeyRound, CheckCircle2, AlertCircle, ShieldCheck, Star, ToggleLeft, ToggleRight, Search} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { SkeletonApplicationList } from "@/components/ui/Skeleton";
import { Button, Input, Spinner} from "@/components/ui";
import { toast } from "sonner";

interface ColorScheme {
  primary: string;
  border: string;
  textOnPrimary: string;
}

interface UserManagementConfig {
  role: "supervisor" | "sponsor";
  pageTitle: string;
  pageIcon: LucideIcon;
  formIcon: LucideIcon;
  countLabel: (n: number) => string;
  emptyTitle: string;
  emptyDescription: string;
  addButtonLabel: string;
  formTitle: string;
  color: ColorScheme;
  nameField: { label: string; placeholder: string };
  emailPlaceholder: string;
  phoneLabel: string;
  phonePlaceholder: string;
  showDepartment: boolean;
  formHint: { text: string; bg: string; border: string; color: string };
  successMessage: string;
  fallbackInitial: string;
  /** مشرفون لا يحتاجون نموذج إضافة — يُضافون عبر طلبات الترقية */
  hideAddForm?: boolean;
  /** يعرض حقل كلمة المرور في الفورم (للمشرفين) */
  showPasswordField?: boolean;
}

const SUPERVISOR_CONFIG: UserManagementConfig = {
  role: "supervisor",
  pageTitle: "إدارة المشرفين الأكاديميين",
  pageIcon: Users,
  formIcon: ShieldCheck,
  countLabel: (n) => `${n} مشرف مسجل`,
  emptyTitle: "لا يوجد مشرفون",
  emptyDescription: "ابدأ بإضافة أول مشرف للمنصة",
  addButtonLabel: "إضافة مشرف جديد",
  formTitle: "بيانات المشرف الجديد",
  color: { primary: "#2D7A3E", border: "#1F5C2E", textOnPrimary: "white" },
  nameField: { label: "الاسم الكامل *", placeholder: "د. أحمد محمد" },
  emailPlaceholder: "supervisor@zuj.edu.jo",
  phoneLabel: "رقم الهاتف",
  phonePlaceholder: "07X-XXX-XXXX",
  showDepartment: true,
  showPasswordField: true,
  formHint: {
    text: "💡 سيستخدم المشرف هذا البريد وكلمة المرور لتسجيل الدخول عبر صفحة /login",
    bg: "bg-info/10",
    border: "border-info/30",
    color: "text-info",
  },
  successMessage: "تم إنشاء حساب المشرف بنجاح!",
  fallbackInitial: "م",
};

const SPONSOR_CONFIG: UserManagementConfig = {
  role: "sponsor",
  pageTitle: "إدارة الداعمين",
  pageIcon: Building2,
  formIcon: Star,
  countLabel: (n) => `${n} داعم مسجل`,
  emptyTitle: "لا يوجد داعمون",
  emptyDescription: "ابدأ بإضافة أول داعم للمنصة",
  addButtonLabel: "إضافة داعم جديد",
  formTitle: "بيانات الداعم الجديد",
  color: { primary: "#C9A227", border: "#B7891A", textOnPrimary: "#111" },
  nameField: { label: "الاسم *", placeholder: "شركة التقنية الأردنية" },
  emailPlaceholder: "sponsor@company.com",
  phoneLabel: "رقم الهاتف *",
  phonePlaceholder: "07XXXXXXXX",
  showDepartment: false,
  showPasswordField: true,
  formHint: {
    text: "💡 سيستخدم الداعم هذا البريد وكلمة المرور لتسجيل الدخول عبر صفحة /login",
    bg: "bg-warning/10",
    border: "border-warning/30",
    color: "text-warning",
  },
  successMessage: "تم إنشاء حساب الداعم بنجاح!",
  fallbackInitial: "د",
};

const ROLE_CONFIGS = {
  supervisor: SUPERVISOR_CONFIG,
  sponsor: SPONSOR_CONFIG,
};

interface UserItem {
  _id: Id<"users">;
  name?: string | null;
  email: string;
  department?: string | null;
  phone?: string | null;
  isActive?: boolean | null;
}

function ProfileModal({ user, config, onClose }: { user: UserItem; config: UserManagementConfig; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="nb-card p-6 w-full max-w-sm space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-lg">الملف الشخصي</h3>
          <button onClick={onClose} className="hover:bg-foreground/5 rounded transition-colors p-1"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl nb-border flex items-center justify-center font-extrabold text-2xl"
            style={{ background: config.color.primary, color: config.color.textOnPrimary }}
          >
            {user.name?.charAt(0) ?? config.fallbackInitial}
          </div>
          <div>
            <p className="font-extrabold text-lg">{user.name ?? "—"}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          {config.showDepartment && (
            <div className="flex justify-between py-1.5 border-b border-border/40">
              <span className="text-muted-foreground">التخصص</span>
              <span className="font-semibold">{user.department ?? "—"}</span>
            </div>
          )}
          <div className="flex justify-between py-1.5 border-b border-border/40">
            <span className="text-muted-foreground">الهاتف</span>
            <span className="font-semibold" dir="ltr">{user.phone ?? "—"}</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-muted-foreground">الحالة</span>
            <span className={`font-bold ${user.isActive !== false ? "text-success" : "text-destructive"}`}>
              {user.isActive !== false ? "فعّال" : "مجمّد"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface UserManagementProps {
  role: "supervisor" | "sponsor";
}

export default function UserManagement({ role }: UserManagementProps) {
  const config = ROLE_CONFIGS[role];
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
      } else if (role === "sponsor") {
        await createSponsor({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone || undefined,
        });
      } else {
        const payload: { name: string; email: string; phone: string; role: "supervisor" | "sponsor"; department?: string } = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role,
        };
        if (config.showDepartment) payload.department = formData.department;
        await createUser(payload);
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
        <div className="flex items-center gap-2 p-3 bg-success/10 nb-border rounded-lg border-success">
          <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
          <p className="text-sm font-semibold text-success">{success}</p>
        </div>
      )}

      {/* Create Form — only for sponsors */}
      {!config.hideAddForm && showForm && (
        <div className="nb-card p-6 border-[3px] animate-slide-up" style={{ borderColor: config.color.primary }}>
          <h3 className="font-extrabold text-lg mb-4 flex items-center gap-2">
            <FormIcon className="w-5 h-5" style={{ color: config.color.primary }} />
            {config.formTitle}
          </h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {error && (
              <div className="md:col-span-2 flex items-center gap-2 p-3 bg-destructive/10 nb-border rounded-lg border-destructive">
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
              <div className={`p-3 rounded-lg ${config.formHint.bg} nb-border ${config.formHint.border} text-sm font-medium ${config.formHint.color} mb-4`}>
                {config.formHint.text}
              </div>
              <Button type="submit" isDisabled={loading} variant="primary" className="w-full md:w-auto" style={{ background: config.color.primary, color: config.color.textOnPrimary, borderColor: config.color.border }}>
                {loading ? <Spinner size="sm" color="current" /> : <Plus className="w-4 h-4" />}
                {loading ? "جاري الإنشاء..." : "إنشاء الحساب"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث بالاسم أو البريد..."
          fullWidth
          className="pr-9"
        />
      </div>

      {/* Users List */}
      {users === undefined ? (
        <SkeletonApplicationList count={4} />
      ) : filtered.length === 0 ? (
        <div className="nb-card p-12 text-center">
          <PageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-extrabold text-lg mb-1">{config.emptyTitle}</h3>
          <p className="text-sm text-muted-foreground">{config.emptyDescription}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((user, i) => (
            <div key={user._id} className="nb-card p-4 flex items-center gap-4 animate-slide-up" style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}>
              <div className="w-12 h-12 rounded-xl nb-border flex items-center justify-center shrink-0 font-extrabold text-lg" style={{ background: config.color.primary, color: config.color.textOnPrimary }}>
                {user.name?.charAt(0) ?? config.fallbackInitial}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-base">{user.name ?? "—"}</h4>
                  <span className={`nb-badge text-xs ${user.isActive !== false ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                    {user.isActive !== false ? "نشط" : "معطل"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground font-medium">{user.email}</p>
                {config.showDepartment && user.department && (
                  <p className="text-xs text-muted-foreground">{user.department}</p>
                )}
                {!config.showDepartment && user.phone && (
                  <p className="text-xs text-muted-foreground" dir="ltr">{user.phone}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setProfileUser(user)}
                  className="hover:bg-foreground/5 rounded transition-colors text-xs flex items-center gap-1 px-2 py-1"
                  title="عرض الملف الشخصي"
                >
                  <User className="w-3.5 h-3.5" />
                  الملف
                </button>
                <button
                  title={user.isActive !== false ? "تجميد الحساب" : "تفعيل الحساب"}
                  onClick={() => handleToggle(user._id, user.isActive === false)}
                  className="p-2 rounded-lg nb-border hover:bg-muted transition-colors"
                >
                  {user.isActive !== false ? (
                    <ToggleRight className="w-6 h-6 text-success" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {profileUser && (
        <ProfileModal user={profileUser} config={config} onClose={() => setProfileUser(null)} />
      )}
    </div>
  );
}
