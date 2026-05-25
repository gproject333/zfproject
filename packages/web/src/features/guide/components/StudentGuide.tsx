"use client";

import {
  Video,
  FileText,
  Lightbulb,
  CheckCircle2,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

interface GuideSection {
  icon: LucideIcon;
  iconBg: string;
  title: string;
  tips: ReactNode[];
}

const SECTIONS: GuideSection[] = [
  {
    icon: Video,
    iconBg: "bg-accent",
    title: "الفيديو التعريفي للمشروع",
    tips: [
      <>
        تُستخدم الصيغ المدعومة: <b>MP4</b> (الأفضل) أو <b>MOV</b> أو <b>WEBM</b>.
      </>,
      <>
        الدقّة الموصى بها: <b>1080p</b> عموديًا أو أفقيًا؛ يُتجنّب ما دون 720p.
      </>,
      <>
        مدّة الفيديو: <b>من دقيقتَين إلى خمس دقائق</b>، تتضمّن التعريف بمقدّم الطلب
        وعرض المشكلة والحلّ والفريق.
      </>,
      <>
        الإضاءة: يُفضَّل التصوير في مكان جيّد الإضاءة، مع توجيه المصدر الضوئي
        من الأمام لا من الخلف.
      </>,
      <>
        الصوت: يُستحسن استخدام سمّاعات بميكروفون (Headset) أو ميكروفون مستقلّ
        لتجنّب صدى الغرفة.
      </>,
      <>
        قبل الرفع: يُراجع الفيديو كاملًا للتأكّد من وضوح الصوت وثبات الصورة.
      </>,
    ],
  },
  {
    icon: FileText,
    iconBg: "bg-secondary",
    title: "ملف المشروع (PDF)",
    tips: [
      <>
        الصيغة المطلوبة: <b>PDF</b> حصرًا. لا تُقبل ملفات Word أو ZIP.
      </>,
      <>
        الحجم الأقصى: <b>10 ميغابايت</b>. عند تجاوز الحدّ، يُضغط الملف عبر
        أداة مثل iLovePDF أو تُخفَّض دقّة الصور داخله.
      </>,
      <>
        الخطّ العربي: يُستخدم خطّ واضح (Cairo أو Tajawal أو IBM Plex Sans Arabic)
        بحجم <b>12-14</b> للنصّ العادي.
      </>,
      <>
        المحتوى المقترح: صفحة غلاف، ملخّص تنفيذي، المشكلة، الحلّ، الفئة
        المستهدفة، نموذج العمل، الفريق، الميزانية.
      </>,
      <>
        يُتحقَّق من وضوح الصور داخل ملفّ PDF ومن عدم فقدان جودتها عند التصدير
        (Export as PDF {">"} High Quality).
      </>,
      <>
        يُراجع الملفّ على شاشة مختلفة قبل الرفع للتأكّد من خلوّه من الأخطاء.
      </>,
    ],
  },
  {
    icon: Lightbulb,
    iconBg: "bg-warning",
    title: "إرشادات عامة لتعبئة الطلب",
    tips: [
      <>
        تُعتمد الكتابة المختصرة الواضحة، فالجملة الواحدة أفضل من الفقرة.
      </>,
      <>
        يُختار اسم المشروع <b>مختصرًا ومعبّرًا</b>، بأسلوب يشبه عناوين الصحف.
      </>,
      <>
        تُذكر <b>مشكلة حقيقية</b> قائمة، مع تحديد الفئة المتأثّرة بها وأساليب
        التعامل الحالية معها.
      </>,
      <>
        يُوضَّح <b>وجه التميّز</b> الذي يقدّمه المشروع مقارنةً بالبدائل المتاحة
        في السوق.
      </>,
      <>
        في حال وجود فريق، تُذكر أسماء الأعضاء وأرقام تواصلهم بدقّة، إذ قد يحتاج
        المشرف إلى التواصل معهم.
      </>,
      <>
        يُراجَع الطلب قبل التقديم، ويمكن حفظه كمسوّدة والعودة إليه لاحقًا.
      </>,
    ],
  },
];

/**
 * Static guide rendered on /student/guide. All content lives here —
 * there's no Convex schema behind it, so supervisors edit the copy by
 * opening a PR rather than through an admin UI.
 */
export default function StudentGuide() {
  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      <div className="mb-8 flex items-start gap-4">
        <div className="w-12 h-12 bg-muted ds-border rounded-xl flex items-center justify-center shrink-0">
          <HelpCircle className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold mb-1">دليل تقديم الطلب</h1>
          <p className="text-sm text-muted-foreground">
            إرشادات عمليّة لرفع ملفّ المشروع والفيديو التعريفي بأفضل جودة
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <section key={section.title} className="ds-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-11 h-11 ${section.iconBg} ds-border rounded-lg flex items-center justify-center shrink-0`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-semibold">{section.title}</h2>
              </div>
              <ul className="space-y-3">
                {section.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-1" />
                    <span className="text-sm leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
