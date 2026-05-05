"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "@/lib/toast";
import {Plus, Trash2, Edit3, Check, X, Link2, Eye, EyeOff} from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import {
  SOCIAL_PLATFORMS,
  getPlatformMeta,
} from "@/lib/configs/socialPlatforms";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { Button, Input, Spinner} from "@/components/ui";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select";

interface DraftLink {
  platform: string;
  url: string;
  label: string;
  order: number;
}

const BLANK_DRAFT: DraftLink = {
  platform: "facebook",
  url: "",
  label: "",
  order: 0,
};

/**
 * Admin-only page for managing the social media links that appear in
 * the site footer. Supports add / edit / activate-toggle / delete with
 * a confirm dialog for destructive actions.
 */
export default function SocialLinksManager() {
  const links = useQuery(api.socialLinks.listAll, {});
  const createLink = useMutation(api.socialLinks.createLink);
  const updateLink = useMutation(api.socialLinks.updateLink);
  const deleteLink = useMutation(api.socialLinks.deleteLink);
  const setActive = useMutation(api.socialLinks.setActive);

  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState<DraftLink>(BLANK_DRAFT);
  const [editingId, setEditingId] = useState<Id<"socialLinks"> | null>(null);
  const [saving, setSaving] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<Id<"socialLinks"> | null>(null);
  const [deleting, setDeleting] = useState(false);

  const platformMeta = getPlatformMeta(draft.platform);

  const startCreate = () => {
    setDraft({ ...BLANK_DRAFT, order: (links?.length ?? 0) * 10 });
    setEditingId(null);
    setShowForm(true);
  };

  const startEdit = (id: Id<"socialLinks">) => {
    const existing = links?.find((l) => l._id === id);
    if (!existing) return;
    setDraft({
      platform: existing.platform,
      url: existing.url,
      label: existing.label ?? "",
      order: existing.order,
    });
    setEditingId(id);
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setDraft(BLANK_DRAFT);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        platform: draft.platform,
        url: draft.url,
        label: draft.label.trim() || undefined,
        order: draft.order,
      };
      if (editingId) {
        await updateLink({ id: editingId, ...payload });
        toast.success("تم تحديث الرابط");
      } else {
        await createLink({ ...payload, isActive: true });
        toast.success("تم إضافة الرابط");
      }
      cancelForm();
    } catch (e: unknown) {
      toast.error("حدث خطأ: " + (e instanceof Error ? e.message : "حاول مرة أخرى."));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id: Id<"socialLinks">, nextActive: boolean) => {
    try {
      await setActive({ id, isActive: nextActive });
    } catch (e: unknown) {
      toast.error("حدث خطأ: " + (e instanceof Error ? e.message : "حاول مرة أخرى."));
    }
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    setDeleting(true);
    try {
      await deleteLink({ id: pendingDeleteId });
      toast.success("تم حذف الرابط");
    } catch (e: unknown) {
      toast.error("حدث خطأ: " + (e instanceof Error ? e.message : "حاول مرة أخرى."));
    } finally {
      setDeleting(false);
      setPendingDeleteId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold flex items-center gap-2 mb-1">
            <Link2 className="w-6 h-6 text-info" />
            روابط التواصل الاجتماعي
          </h2>
          <p className="text-sm text-muted-foreground font-medium">
            الروابط التي تظهر في تذييل الصفحة — يراها كل الزوار
          </p>
        </div>
        <Button
          type="button"
          onPress={showForm ? cancelForm : startCreate}
          variant="primary"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "إلغاء" : "رابط جديد"}
        </Button>
      </div>

      {/* Create / edit form */}
      {showForm && (
        <form
          onSubmit={submit}
          className="nb-card p-6 border-[3px] border-info/50 animate-slide-up space-y-4"
        >
          <h3 className="font-extrabold text-lg">
            {editingId ? "تعديل الرابط" : "رابط جديد"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-bold" htmlFor="platform-select">
                المنصة *
              </label>
              <Select
                value={draft.platform}
                onValueChange={(v) => setDraft((d) => ({ ...d, platform: v }))}
              >
                <SelectTrigger aria-labelledby="platform-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SOCIAL_PLATFORMS.map((p) => (
                    <SelectItem key={p.key} value={p.key}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-bold" htmlFor="url-input">
                الرابط *
              </label>
              <Input
                id="url-input"
                type="text"
                dir="ltr"
                fullWidth
                placeholder={platformMeta.placeholder}
                value={draft.url}
                onChange={(e) => setDraft((d) => ({ ...d, url: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-bold" htmlFor="label-input">
                تسمية بديلة (اختياري)
              </label>
              <Input
                id="label-input"
                type="text"
                fullWidth
                placeholder={platformMeta.label}
                value={draft.label}
                onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))}
                maxLength={60}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-bold" htmlFor="order-input">
                ترتيب العرض
              </label>
              <Input
                id="order-input"
                type="number"
                fullWidth
                value={String(draft.order)}
                onChange={(e) => setDraft((d) => ({ ...d, order: Number(e.target.value) || 0 }))}
              />
              <p className="text-xs text-muted-foreground">
                الأقل يظهر أولاً — استخدم 10, 20, 30 للتدرّج
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              onPress={cancelForm}
              isDisabled={saving}
              variant="outline"
              className="flex-1 sm:flex-initial"
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              isDisabled={saving}
              variant="primary"
              className="flex-1 sm:flex-initial"
            >
              {saving ? <Spinner size="sm" color="current" /> : <Check className="w-4 h-4" />}
              {editingId ? "حفظ التعديل" : "إضافة"}
            </Button>
          </div>
        </form>
      )}

      {/* Links list */}
      <div>
        <h3 className="font-extrabold text-lg mb-4">الروابط الحالية</h3>
        {links === undefined ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted rounded-lg nb-border animate-pulse" />
            ))}
          </div>
        ) : links.length === 0 ? (
          <div className="nb-card p-12 text-center">
            <Link2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h4 className="font-extrabold text-lg mb-1">لا توجد روابط بعد</h4>
            <p className="text-sm text-muted-foreground">
              أضف أول رابط تواصل ليظهر في تذييل الموقع
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {links.map((link) => {
              const meta = getPlatformMeta(link.platform);
              const Icon = meta.icon;
              return (
                <div
                  key={link._id}
                  className={`nb-card p-4 flex items-center gap-4 ${
                    link.isActive ? "" : "opacity-60"
                  }`}
                >
                  <div className="w-10 h-10 bg-muted nb-border rounded-lg flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm">
                        {link.label || meta.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        #{link.order}
                      </span>
                    </div>
                    <p
                      className="text-xs text-muted-foreground truncate"
                      dir="ltr"
                    >
                      {link.url}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => void toggleActive(link._id, !link.isActive)}
                      title={link.isActive ? "إخفاء" : "إظهار"}
                      aria-label={link.isActive ? "إخفاء الرابط" : "إظهار الرابط"}
                      className="w-9 h-9 nb-border rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
                    >
                      {link.isActive ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => startEdit(link._id)}
                      title="تعديل"
                      aria-label="تعديل الرابط"
                      className="w-9 h-9 nb-border rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingDeleteId(link._id)}
                      title="حذف"
                      aria-label="حذف الرابط"
                      className="w-9 h-9 nb-border rounded-lg flex items-center justify-center hover:bg-destructive/10 hover:border-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => {
          if (!deleting && !open) setPendingDeleteId(null);
        }}
        title="حذف الرابط"
        description="هل أنت متأكد من حذف هذا الرابط؟ سيختفي فوراً من تذييل الموقع."
        icon={<Trash2 className="w-6 h-6 text-destructive" />}
        destructive
        confirmLabel="حذف"
        cancelLabel="إلغاء"
        isSubmitting={deleting}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
