"use client";

import { useRouter } from "next/navigation";
import {ArrowRight, Save, Send, FileText, AlertCircle, CheckCircle2, Bell, Clock4, Eye} from "lucide-react";
import { TYPE_CONFIG } from "@/lib/configs/application";
import FileUploadFields from "@/features/applications/components/FileUploadFields";
import FormError from "@/features/applications/components/FormError";
import {
  useCreateApplication,
} from "@/features/student/hooks/useCreateApplication";
import type { ApplicationType } from "@/features/student/hooks/useApplicationForm";
import ApplicationFormFields from "./ApplicationFormFields";
import { Button, Spinner, Card} from "@/components/ui";
import { Dialog, DialogContent } from "@/components/ui/Dialog";

interface ApplicationCreateFormProps {
  type: ApplicationType;
}

/**
 * Rendering-only component for the "create new application" page.
 * All state, mutations, validation, and redirect logic live in
 * useCreateApplication. This component composes header + form fields
 * + file uploads + draft/submit buttons + tips card.
 */
export default function ApplicationCreateForm({ type }: ApplicationCreateFormProps) {
  const router = useRouter();
  const config = TYPE_CONFIG[type];
  const { form, upload, loading, submitMode, submit, success, goToApplication, draft } =
    useCreateApplication(type);

  const handleRestore = () => {
    if (draft.pendingRestore) {
      form.resetForm(draft.pendingRestore.formData);
    }
    draft.acceptRestore();
  };

  if (!config) {
    return (
      <Card className="p-12 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">نوع غير صالح.</h3>
        <Button
          onPress={() => router.push("/student/new")}
          variant="primary"
          className="mt-4"
        >
          العودة إلى اختيار النوع
        </Button>
      </Card>
    );
  }

  const Icon = config.icon;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push("/student/new")}
          aria-label="العودة"
          className="w-10 h-10 ds-border rounded-lg flex items-center justify-center bg-card ds-shadow-hover shrink-0"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        <div className="w-12 h-12 bg-muted ds-border rounded-xl flex items-center justify-center shrink-0">
          <Icon className={`w-6 h-6 ${config.color}`} />
        </div>
        <div>
          <h2 className="text-xl font-bold">{config.formTitle}</h2>
          <p className="text-sm text-muted-foreground">{config.formSubtitle}</p>
        </div>
      </div>

      {/* Draft restore prompt — appears once on mount if a previous draft
          for this same type is sitting in localStorage. */}
      {draft.pendingRestore && (
        <Card className="mb-4 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 border-primary/30 bg-primary/[0.05]">
          <div className="w-11 h-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
            <Save className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-extrabold text-sm">توجد مسودة محفوظة من جلسة سابقة.</p>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              يمكن استئناف العمل عليها؛ فالبيانات محفوظة محليًا على الجهاز.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button onPress={handleRestore} variant="primary" size="sm">
              استعادة
            </Button>
            <Button onPress={draft.dismissRestore} variant="outline" size="sm">
              تجاهل
            </Button>
          </div>
        </Card>
      )}

      {/* Form */}
      <Card className="p-6 md:p-8">
        <FormError message={form.errors.form} shake className="mb-6" />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void submit("submit");
          }}
          className="space-y-6"
        >
          <div className="pb-4 border-b-2 border-foreground/10">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              المعلومات الأساسية
            </h3>
            <ApplicationFormFields
              type={type}
              formData={form.formData}
              errors={form.errors}
              updateField={form.updateField}
              validateField={form.validateField}
              extraFields={form.extraFields}
            />
          </div>

          <div className="pb-4">
            <FileUploadFields upload={upload} variant="create" />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              type="button"
              onPress={() => void submit("draft")}
              isDisabled={loading}
              variant="outline"
              className="flex-1"
            >
              {loading && submitMode === "draft" ? (
                <Spinner size="sm" color="current" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              حفظ كمسودة
            </Button>
            <Button type="submit" isDisabled={loading} variant="secondary" className="flex-[2]">
              {loading && submitMode === "submit" ? (
                <>
                  <Spinner size="sm" color="current" />
                  جارٍ التقديم...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  تقديم الطلب
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* Tips */}
      <div className="mt-6 ds-card p-5 bg-muted/50">
        <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-success" />
          إرشادات تقديم الطلب
        </h4>
        <ul className="text-sm text-muted-foreground font-medium space-y-1 list-disc list-inside">
          <li>تقديم وصف واضح ومفصَّل للمشروع.</li>
          <li>تحديد المشكلة التي يعالجها المشروع بدقة.</li>
          <li>إرفاق فيديو تعريفي يُعزِّز فرص القبول.</li>
          <li>يمكن حفظ المسودة والعودة إليها لاحقًا.</li>
        </ul>
      </div>

      {/* Submit-success celebration. Stops the form from disappearing
          silently so the student understands the next phase before
          landing on a read-only detail page. */}
      <Dialog open={!!success} onOpenChange={(open) => !open && goToApplication()}>
        <DialogContent title="تم إرسال الطلب بنجاح." className="max-w-md">
          <div className="space-y-5">
            <div className="flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-success/15 text-success flex items-center justify-center ring-4 ring-success/10">
                <CheckCircle2 className="w-10 h-10" />
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground font-medium leading-relaxed">
              تم استلام الطلب وإحالته إلى المشرف الأكاديمي للمراجعة.
            </p>

            <ul className="space-y-2.5 bg-muted/40 ds-border rounded-xl p-4">
              <NextStep
                icon={<Eye className="w-4 h-4" />}
                label="يقوم المشرف بمراجعة تفاصيل الطلب."
              />
              <NextStep
                icon={<Clock4 className="w-4 h-4" />}
                label="يُتوقَّع صدور القرار خلال 3–5 أيام عمل."
              />
              <NextStep
                icon={<Bell className="w-4 h-4" />}
                label="سيُرسَل إشعار فور صدور القرار."
              />
            </ul>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <Button
                onPress={() => goToApplication()}
                variant="secondary"
                fullWidth
              >
                عرض الطلب
                <ArrowRight className="w-4 h-4 rotate-180" />
              </Button>
              <Button
                onPress={() => router.push("/student")}
                variant="outline"
                fullWidth
              >
                العودة إلى لوحة التحكم
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NextStep({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <li className="flex items-center gap-3 text-sm font-semibold text-foreground">
      <span className="w-8 h-8 rounded-lg bg-primary/12 text-primary flex items-center justify-center shrink-0">
        {icon}
      </span>
      {label}
    </li>
  );
}
