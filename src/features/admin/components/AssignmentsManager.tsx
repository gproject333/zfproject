"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { toast } from "sonner";
import {
  Link2,
  Plus,
  Trash2,
  Building2,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { formatArabicDate } from "@/lib/formatters";

/**
 * Admin tool: link sponsors to accepted projects.
 * Combines a create form (sponsor + project + notes) with a list of
 * current assignments and a per-row remove action.
 */
export default function AssignmentsManager() {
  const sponsors = useQuery(api.users.admin.getAllUsers, { role: "sponsor" });
  const applications = useQuery(api.applications.supervisor.applicationsByStatus, { status: "accepted" });
  const assignments = useQuery(api.applications.sponsor.getSponsorAssignments, {});
  const assignSponsor = useMutation(api.applications.sponsor.assignSponsor);
  const removeAssignment = useMutation(api.applications.sponsor.removeSponsorAssignment);

  const [selectedSponsor, setSelectedSponsor] = useState<string>("");
  const [selectedApp, setSelectedApp] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!selectedSponsor || !selectedApp) {
      setError("يرجى اختيار الراعي والمشروع");
      return;
    }
    setLoading(true);
    try {
      await assignSponsor({
        sponsorId: selectedSponsor as Id<"users">,
        applicationId: selectedApp as Id<"applications">,
        notes: notes || undefined,
      });
      setSuccess("تم ربط الراعي بالمشروع بنجاح!");
      setSelectedSponsor("");
      setSelectedApp("");
      setNotes("");
      setShowForm(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = (assignmentId: Id<"sponsorAssignments">) => {
    toast("هل أنت متأكد من حذف هذا الربط؟", {
      action: {
        label: "حذف",
        onClick: async () => {
          try {
            await removeAssignment({ assignmentId });
            toast.success("تم حذف الربط");
          } catch (e: unknown) {
            toast.error("خطأ: " + (e instanceof Error ? e.message : String(e)));
          }
        },
      },
      cancel: { label: "إلغاء", onClick: () => {} },
    });
  };

  // Lookups for sponsor names and project names
  const sponsorMap = new Map(sponsors?.map((s) => [s._id, s.name ?? s.email]) ?? []);
  const appMap = new Map(applications?.map((a) => [a._id, a.projectName]) ?? []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold flex items-center gap-2 mb-1">
            <Link2 className="w-6 h-6 text-info" />
            ربط الرعاة بالمشاريع
          </h2>
          <p className="text-sm text-muted-foreground font-medium">
            تعيين الرعاة للمشاريع المقبولة — {assignments?.length ?? 0} رابط حالي
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setError("");
            setSuccess("");
          }}
          className="nb-btn nb-btn-accent font-bold"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "إلغاء" : "ربط جديد"}
        </button>
      </div>

      {/* Success */}
      {success && (
        <div className="flex items-center gap-2 p-3 bg-success/10 nb-border rounded-lg border-success">
          <CheckCircle2 className="w-5 h-5 text-success" />
          <p className="text-sm font-semibold text-success">{success}</p>
        </div>
      )}

      {/* Assign Form */}
      {showForm && (
        <div className="nb-card p-6 border-[3px] border-info/50 animate-slide-up">
          <h3 className="font-extrabold text-lg mb-4 flex items-center gap-2">
            <Link2 className="w-5 h-5 text-info" />
            ربط راعٍ بمشروع
          </h3>
          <form onSubmit={handleAssign} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 nb-border rounded-lg border-destructive">
                <AlertCircle className="w-4 h-4 text-destructive" />
                <p className="text-sm font-semibold text-destructive">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-bold">اختر الراعي *</label>
                <div className="relative">
                  <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <select
                    className="nb-input pr-10 w-full"
                    value={selectedSponsor}
                    onChange={(e) => setSelectedSponsor(e.target.value)}
                    required
                  >
                    <option value="">— اختر الراعي —</option>
                    {sponsors?.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name ?? s.email}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-bold">اختر المشروع المقبول *</label>
                <div className="relative">
                  <FileText className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <select
                    className="nb-input pr-10 w-full"
                    value={selectedApp}
                    onChange={(e) => setSelectedApp(e.target.value)}
                    required
                  >
                    <option value="">— اختر المشروع —</option>
                    {applications?.map((a) => (
                      <option key={a._id} value={a._id}>
                        {a.projectName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-bold">ملاحظات (اختياري)</label>
              <textarea
                className="nb-input min-h-[80px]"
                placeholder="ملاحظات خاصة بهذا الربط..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {applications?.length === 0 && (
              <div className="p-3 bg-warning/10 nb-border border-warning/30 rounded-lg text-sm font-medium text-warning">
                ⚠️ لا توجد مشاريع مقبولة حالياً. يجب قبول مشروع أولاً ثم ربطه براعٍ.
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !applications?.length}
              className="nb-btn nb-btn-accent w-full md:w-auto"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
              {loading ? "جاري الربط..." : "تأكيد الربط"}
            </button>
          </form>
        </div>
      )}

      {/* Current Assignments */}
      <div>
        <h3 className="font-extrabold text-lg mb-4">الروابط الحالية</h3>
        {assignments === undefined ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted rounded-lg nb-border animate-pulse" />
            ))}
          </div>
        ) : assignments.length === 0 ? (
          <div className="nb-card p-12 text-center">
            <Link2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h4 className="font-extrabold text-lg mb-1">لا توجد روابط</h4>
            <p className="text-sm text-muted-foreground">ابدأ بربط الرعاة مع المشاريع المقبولة</p>
          </div>
        ) : (
          <div className="space-y-3">
            {assignments.map((a, i) => {
              const sponsorName = sponsorMap.get(a.sponsorId) ?? "راعٍ غير معروف";
              const appName = appMap.get(a.applicationId) ?? "مشروع غير معروف";

              return (
                <div
                  key={a._id}
                  className="nb-card p-4 flex items-center gap-4 animate-slide-up"
                  style={{ animationDelay: `${i * 0.04}s`, opacity: 0 }}
                >
                  <div
                    className="w-10 h-10 rounded-lg nb-border flex items-center justify-center shrink-0 font-extrabold text-sm"
                    style={{ background: "#C9A227", color: "#111" }}
                  >
                    {sponsorName.charAt(0)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm">{sponsorName}</span>
                      <Link2 className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="font-bold text-sm text-accent">{appName}</span>
                    </div>
                    {a.notes && <p className="text-xs text-muted-foreground mt-0.5">{a.notes}</p>}
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatArabicDate(a.createdAt)}
                    </p>
                  </div>

                  <button
                    title="حذف الربط"
                    onClick={() => handleRemove(a._id)}
                    className="shrink-0 w-9 h-9 nb-border rounded-lg flex items-center justify-center hover:bg-destructive/10 hover:border-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
