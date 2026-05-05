"use client";

import type { Doc } from "../../../../convex/_generated/dataModel";
import {Compass, Plus, Edit3, Trash2, ExternalLink, Video, GraduationCap, Link2} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import { formatArabicDate } from "@/lib/formatters";
import GuideFormDialog from "./GuideFormDialog";
import { useGuideForm } from "../hooks/useGuideForm";
import { Button, Spinner} from "@/components/ui";

const TYPE_LABEL = {
  video: "فيديو",
  course: "دورة",
  link: "رابط",
} as const;

const TYPE_ICON = {
  video: Video,
  course: GraduationCap,
  link: Link2,
} as const;

export default function GuideManager() {
  const form = useGuideForm();
  const { admin } = form;

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-extrabold flex items-center gap-2">
          <Compass className="w-6 h-6 text-accent" />
          الدليل الريادي
          {!admin.loading && (
            <span className="text-base font-bold text-muted-foreground">
              — {admin.resources?.length ?? 0} مورد
            </span>
          )}
        </h2>
        <Button
          type="button"
          onPress={form.openCreateDialog}
          variant="primary"
          size="sm"
        >
          <Plus className="w-4 h-4" />
          إضافة مورد
        </Button>
      </div>

      {admin.loading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" color="current" className="text-accent" />
        </div>
      ) : !admin.resources || admin.resources.length === 0 ? (
        <EmptyState
          variant="empty-inbox"
          title="لا توجد موارد بعد"
          description="أضف فيديوهات ودورات وروابط لتظهر للطلاب في دليلهم الريادي."
          action={
            <Button
              onPress={form.openCreateDialog}
              variant="primary"
            >
              <Plus className="w-5 h-5" />
              إضافة مورد
            </Button>
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>العنوان</TableHead>
              <TableHead>النوع</TableHead>
              <TableHead>الرابط</TableHead>
              <TableHead>التاريخ</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {admin.resources.map((r: Doc<"entrepreneurialGuide">) => {
              const Icon = TYPE_ICON[r.type];
              return (
                <TableRow key={r._id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 shrink-0 text-muted-foreground" />
                      <span className="font-bold line-clamp-1">{r.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="nb-badge-soft !bg-muted">{TYPE_LABEL[r.type]}</span>
                  </TableCell>
                  <TableCell>
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary underline line-clamp-1 max-w-[200px] inline-block"
                      dir="ltr"
                    >
                      {r.url}
                    </a>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">
                      {formatArabicDate(r.createdAt)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 nb-border rounded-lg flex items-center justify-center bg-card hover:bg-muted"
                        aria-label="فتح"
                        title="فتح"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        type="button"
                        onClick={() => form.openEditDialog(r)}
                        className="w-8 h-8 nb-border rounded-lg flex items-center justify-center bg-card hover:bg-muted"
                        aria-label="تعديل"
                        title="تعديل"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => form.setToDelete(r._id)}
                        className="w-8 h-8 nb-border rounded-lg flex items-center justify-center bg-card hover:bg-destructive/10 hover:border-destructive text-destructive"
                        aria-label="حذف"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      <GuideFormDialog
        open={form.dialogOpen}
        onOpenChange={form.setDialogOpen}
        editing={admin.editingId !== null}
        saving={admin.saving}
        formError={admin.formError}
        formState={admin.formState}
        setFormField={admin.setFormField}
        onSubmit={() => void form.submit()}
      />

      <ConfirmDialog
        open={form.toDelete !== null}
        onOpenChange={(open) => {
          if (!open) form.setToDelete(null);
        }}
        title="حذف المورد"
        description="سيتم حذف هذا المورد نهائياً. لا يمكن التراجع."
        destructive
        confirmLabel="حذف"
        cancelLabel="إلغاء"
        onConfirm={() => void form.confirmDelete()}
      />
    </div>
  );
}
