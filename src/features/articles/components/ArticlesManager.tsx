"use client";

import Link from "next/link";
import {
  BookOpen,
  Plus,
  Loader2,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
} from "lucide-react";
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
import ArticleFormDialog from "./ArticleFormDialog";
import { useArticleForm } from "../hooks/useArticleForm";
import { Button } from "@/components/ui";

const AUDIENCE_LABEL = {
  student: "الطلاب",
  supervisor: "المشرفون",
  all: "الجميع",
} as const;

/**
 * Supervisor-facing article management page. Lists every article
 * (incl. drafts) and wires create/edit/delete/publish actions into
 * the shared form dialog.
 */
export default function ArticlesManager() {
  const form = useArticleForm();
  const { admin } = form;

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-extrabold flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-accent" />
          إدارة المقالات
          {!admin.loading && (
            <span className="text-base font-bold text-muted-foreground">
              — {admin.articles?.length ?? 0} مقالة
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
          مقالة جديدة
        </Button>
      </div>

      {admin.loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : !admin.articles || admin.articles.length === 0 ? (
        <EmptyState
          variant="empty-inbox"
          title="لا توجد مقالات بعد"
          description="ابدأ بنشر أول مقالة لتظهر للطلاب في صفحة المقالات."
          action={
            <Button
              onPress={form.openCreateDialog}
              variant="primary"
            >
              <Plus className="w-5 h-5" />
              مقالة جديدة
            </Button>
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>العنوان</TableHead>
              <TableHead>الجمهور</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>المؤلف</TableHead>
              <TableHead>التاريخ</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {admin.articles.map((a) => (
              <TableRow key={a._id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {a.coverUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={a.coverUrl}
                        alt=""
                        className="w-12 h-8 object-cover rounded nb-border shrink-0"
                      />
                    )}
                    <span className="font-bold line-clamp-1">{a.title}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="nb-badge-soft !bg-muted">
                    {AUDIENCE_LABEL[a.audience]}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={`nb-badge-soft ${
                      a.isPublished
                        ? "!bg-success !text-white"
                        : "!bg-muted text-muted-foreground"
                    }`}
                  >
                    {a.isPublished ? "منشورة" : "مسودة"}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{a.authorName ?? "مشرف"}</span>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-muted-foreground">
                    {formatArabicDate(a.createdAt)}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/supervisor/articles/${a._id}`}
                      className="w-8 h-8 nb-border rounded-lg flex items-center justify-center bg-card hover:bg-muted"
                      aria-label="معاينة"
                      title="معاينة"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => void admin.toggle(a._id, !a.isPublished)}
                      className="w-8 h-8 nb-border rounded-lg flex items-center justify-center bg-card hover:bg-muted"
                      aria-label={a.isPublished ? "إخفاء" : "نشر"}
                      title={a.isPublished ? "إخفاء" : "نشر"}
                    >
                      {a.isPublished ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => form.openEditDialog(a)}
                      className="w-8 h-8 nb-border rounded-lg flex items-center justify-center bg-card hover:bg-muted"
                      aria-label="تعديل"
                      title="تعديل"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => form.setToDelete(a._id)}
                      className="w-8 h-8 nb-border rounded-lg flex items-center justify-center bg-card hover:bg-destructive/10 hover:border-destructive text-destructive"
                      aria-label="حذف"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <ArticleFormDialog
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
        title="حذف المقالة"
        description="سيتم حذف المقالة وصورة غلافها نهائياً. لا يمكن التراجع."
        destructive
        confirmLabel="حذف"
        cancelLabel="إلغاء"
        onConfirm={() => void form.confirmDelete()}
      />
    </div>
  );
}
