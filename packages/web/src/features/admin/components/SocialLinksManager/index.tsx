"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "@/lib/toast";
import {Plus, Trash2, X, Link2} from "lucide-react";
import { api } from "@smart-zuj/convex";
import type { Id } from "@smart-zuj/convex";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { Button, Card} from "@/components/ui";
import { SocialLinkForm } from "./SocialLinkForm";
import { SocialLinkRow } from "./SocialLinkRow";
import { BLANK_DRAFT, type DraftLink } from "./types";

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
        toast.success("تمت إضافة الرابط");
      }
      cancelForm();
    } catch (e: unknown) {
      toast.error("حدث خطأ: " + (e instanceof Error ? e.message : "يُرجى المحاولة مجددًا."));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id: Id<"socialLinks">, nextActive: boolean) => {
    try {
      await setActive({ id, isActive: nextActive });
    } catch (e: unknown) {
      toast.error("حدث خطأ: " + (e instanceof Error ? e.message : "يُرجى المحاولة مجددًا."));
    }
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    setDeleting(true);
    try {
      await deleteLink({ id: pendingDeleteId });
      toast.success("تم حذف الرابط");
    } catch (e: unknown) {
      toast.error("حدث خطأ: " + (e instanceof Error ? e.message : "يُرجى المحاولة مجددًا."));
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
            الروابط الظاهرة في تذييل الصفحة لجميع الزوار
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
        <SocialLinkForm
          draft={draft}
          setDraft={setDraft}
          editingId={editingId}
          saving={saving}
          submit={submit}
          cancelForm={cancelForm}
        />
      )}

      {/* Links list */}
      <div>
        <h3 className="font-extrabold text-lg mb-4">الروابط الحالية</h3>
        {links === undefined ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted rounded-lg ds-border animate-pulse" />
            ))}
          </div>
        ) : links.length === 0 ? (
          <Card className="p-12 text-center">
            <Link2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h4 className="font-extrabold text-lg mb-1">لا توجد روابط بعد</h4>
            <p className="text-sm text-muted-foreground">
              أضف أول رابط تواصل ليظهر في تذييل الموقع.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {links.map((link) => (
              <SocialLinkRow
                key={link._id}
                link={link}
                toggleActive={toggleActive}
                startEdit={startEdit}
                setPendingDeleteId={setPendingDeleteId}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => {
          if (!deleting && !open) setPendingDeleteId(null);
        }}
        title="حذف الرابط"
        description="هل تؤكد حذف هذا الرابط؟ سيُزال فورًا من تذييل الموقع."
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
