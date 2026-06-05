"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useMutation } from "convex/react";
import { X, Save } from "lucide-react";
import { api } from "@smart-zuj/convex";
import type { Id } from "@smart-zuj/convex";
import { Button, Card, Spinner } from "@/components/ui";
import { toast } from "@/lib/toast";
import { getConvexErrorMessage } from "@/lib/errors";

export interface EditUserTarget {
  _id: Id<"users">;
  name?: string | null;
  department?: string | null;
  phone?: string | null;
}

/**
 * Admin-only edit dialog for the limited set of fields an admin may change
 * on any user: name, department, phone. Backed by
 * `api.users.admin.updateUserByAdmin` — no Clerk/email changes. Portaled to
 * body and scroll-locked, matching the ProfileModal pattern.
 */
export default function EditUserModal({
  user,
  showDepartment,
  onClose,
}: {
  user: EditUserTarget;
  showDepartment: boolean;
  onClose: () => void;
}) {
  const updateUser = useMutation(api.users.admin.updateUserByAdmin);
  const [name, setName] = useState(user.name ?? "");
  const [department, setDepartment] = useState(user.department ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("الاسم حقل إلزامي.");
      return;
    }
    setSaving(true);
    try {
      await updateUser({
        userId: user._id,
        name: name.trim(),
        ...(showDepartment ? { department: department.trim() } : {}),
        phone: phone.trim(),
      });
      toast.success("تم تحديث البيانات بنجاح");
      onClose();
    } catch (e: unknown) {
      toast.error(getConvexErrorMessage(e, "تعذّر تحديث البيانات، يُرجى المحاولة مجددًا."));
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <Card className="p-6 w-full max-w-sm space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-lg">تعديل بيانات المستخدم</h3>
          <button onClick={onClose} className="hover:bg-foreground/5 rounded transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label htmlFor="edit-name" className="block text-sm font-bold mb-1.5">
              الاسم الكامل *
            </label>
            <input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full ds-border rounded-lg px-3 py-2 bg-card text-sm"
            />
          </div>

          {showDepartment && (
            <div>
              <label htmlFor="edit-department" className="block text-sm font-bold mb-1.5">
                التخصص
              </label>
              <input
                id="edit-department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full ds-border rounded-lg px-3 py-2 bg-card text-sm"
              />
            </div>
          )}

          <div>
            <label htmlFor="edit-phone" className="block text-sm font-bold mb-1.5">
              رقم الهاتف
            </label>
            <input
              id="edit-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              dir="ltr"
              className="w-full ds-border rounded-lg px-3 py-2 bg-card text-sm text-right"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onPress={onClose} isDisabled={saving}>
            إلغاء
          </Button>
          <Button variant="primary" className="flex-1" onPress={() => void handleSave()} isDisabled={saving}>
            {saving ? <Spinner size="sm" color="current" /> : <Save className="w-4 h-4" />}
            حفظ
          </Button>
        </div>
      </Card>
    </div>,
    document.body,
  );
}
