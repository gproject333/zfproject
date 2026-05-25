"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { UserCircle, ArrowLeft, Sparkles } from "lucide-react";
import { Card, Spinner } from "@/components/ui";
import { useProfileComplete } from "../hooks/useProfileComplete";

/**
 * Wraps any route that should only be available once the student profile
 * has the data a supervisor will rely on (الرقم الجامعي + الكلية + التخصص).
 *
 * When complete, renders children unchanged. When incomplete, renders a
 * dedicated explainer card that names the missing fields and links to the
 * profile page. Avoids a silent redirect — the student needs to know why
 * the path changed, not just where they ended up.
 */
export default function ProfileCompletionGate({ children }: { children: ReactNode }) {
  const { loading, isComplete, missing } = useProfileComplete();

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="xl" color="current" className="text-primary" />
      </div>
    );
  }

  if (isComplete) return <>{children}</>;

  return (
    <Card className="max-w-xl mx-auto p-8 sm:p-10 text-center space-y-5 animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-primary/15 text-primary flex items-center justify-center mx-auto">
        <UserCircle className="w-8 h-8" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-extrabold">يُرجى استكمال البيانات الشخصية أولًا.</h2>
        <p className="text-sm text-muted-foreground font-medium leading-relaxed">
          يحتاج المشرف الأكاديمي إلى البيانات الأساسية لمراجعة الطلب والتواصل
          مع مقدِّمه. يُرجى استكمالها قبل تقديم الطلب.
        </p>
      </div>

      {missing.length > 0 && (
        <div className="inline-flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-warning bg-warning/10 border border-warning/30 rounded-full px-3 py-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          البيانات الناقصة: {missing.join("، ")}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-stretch justify-center gap-3 pt-2">
        <Link
          href="/student/profile"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-primary text-primary-foreground font-bold text-sm ds-shadow-sm hover:bg-accent transition-colors"
        >
          <UserCircle className="w-4 h-4" />
          استكمال البيانات
        </Link>
        <Link
          href="/student"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-card text-foreground font-bold text-sm ds-border hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          العودة إلى لوحة التحكم
        </Link>
      </div>
    </Card>
  );
}
