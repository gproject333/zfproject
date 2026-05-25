"use client";

import { useState } from "react";
import { Plus, Mail, User, Building, Phone, KeyRound, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Button, Input, Spinner, Card } from "@/components/ui";
import type { UserManagementConfig } from "../config";

interface CreateUserFormProps {
  config: UserManagementConfig;
  formData: { name: string; email: string; department: string; phone: string; password: string };
  setFormData: React.Dispatch<React.SetStateAction<{ name: string; email: string; department: string; phone: string; password: string }>>;
  loading: boolean;
  error: string;
  onSubmit: (e: React.FormEvent) => void;
}

export function CreateUserForm({ config, formData, setFormData, loading, error, onSubmit }: CreateUserFormProps) {
  const FormIcon = config.formIcon;
  const [showPassword, setShowPassword] = useState(false);
  return (
    <Card className="p-6 border-[3px] animate-slide-up" style={{ borderColor: config.color.primary }}>
      <h3 className="font-extrabold text-lg mb-4 flex items-center gap-2">
        <FormIcon className="w-5 h-5" style={{ color: config.color.primary }} />
        {config.formTitle}
      </h3>
      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Input fullWidth className="pr-10" placeholder="مثال: هندسة البرمجيات" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} />
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
                className="pr-10 pl-10"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                dir="ltr"
                style={{ textAlign: "left" }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
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
            {loading ? "يجري الإنشاء..." : "إنشاء الحساب"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
