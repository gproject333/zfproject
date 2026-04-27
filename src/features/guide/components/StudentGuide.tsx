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
        استخدم الصيغ المدعومة: <b>MP4</b> (الأفضل) أو <b>MOV</b> أو <b>WEBM</b>.
      </>,
      <>
        دقّة موصى بها: <b>1080p</b> عمودي أو أفقي؛ تجنّب أقل من 720p.
      </>,
      <>
        مدّة الفيديو: <b>من دقيقتَين إلى خمس دقائق</b>. عرّف نفسك، اشرح المشكلة،
        ثم الحل والفريق.
      </>,
      <>
        الإضاءة: صوّر في مكان مضاء جيداً، مع الإضاءة أمامك لا خلفك.
      </>,
      <>
        الصوت: استخدم سمّاعات برأس لاقط صوت (Headset) أو ميكروفون منفصل لتجنّب
        صدى الغرفة.
      </>,
      <>
        قبل الرفع: شاهد الفيديو كاملاً للتأكد من وضوح الصوت وعدم اهتزاز الصورة.
      </>,
    ],
  },
  {
    icon: FileText,
    iconBg: "bg-secondary",
    title: "ملف المشروع (PDF)",
    tips: [
      <>
        الصيغة المطلوبة: <b>PDF</b> فقط. لا تُرسل صور Word أو ZIP.
      </>,
      <>
        الحجم الأقصى: <b>10 ميغابايت</b>. لو كان أكبر اضغطه عبر أداة مثل
        iLovePDF أو تقليل دقة الصور داخله.
      </>,
      <>
        الخط العربي: استخدم خطاً واضحاً (Cairo، Tajawal، IBM Plex Sans Arabic)
        بحجم <b>12-14</b> للنص العادي.
      </>,
      <>
        المحتوى المقترح: صفحة غلاف، ملخص تنفيذي، المشكلة، الحل، الفئة
        المستهدفة، نموذج العمل، الفريق، الميزانية.
      </>,
      <>
        تأكد من أن الصور داخل الـ PDF واضحة ولم تفقد جودتها عند التصدير
        (Export as PDF {">"} High Quality).
      </>,
      <>
        راجع الملف على شاشة مختلفة قبل الرفع للتأكد من عدم وجود أخطاء خطّية.
      </>,
    ],
  },
  {
    icon: Lightbulb,
    iconBg: "bg-warning",
    title: "نصائح عامة لتعبئة الطلب",
    tips: [
      <>
        اكتب باختصار ووضوح — الجملة الواحدة أفضل من الفقرة.
      </>,
      <>
        اجعل اسم المشروع <b>مختصراً ومعبراً</b> — فكّر كعنوان صحيفة.
      </>,
      <>
        اذكر <b>مشكلة حقيقية</b> تراها من حولك، ومن يعانيها، وكيف يتعامل معها
        الآن.
      </>,
      <>
        وضّح <b>ما الذي يميّز مشروعك</b> عن البدائل الموجودة بالسوق.
      </>,
      <>
        إذا كان هناك فريق، اذكر أسماء الأعضاء ورقم كل واحد بدقّة — المشرف قد
        يتواصل معهم.
      </>,
      <>
        راجع الطلب قبل التقديم — تستطيع حفظه كمسودة والعودة له لاحقاً.
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
        <div className="w-12 h-12 bg-primary nb-border rounded-xl flex items-center justify-center shrink-0">
          <HelpCircle className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold mb-1">دليل تقديم الطلب</h1>
          <p className="text-sm text-muted-foreground font-bold">
            نصائح عملية لرفع ملف المشروع والفيديو التعريفي بأفضل جودة
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <section
              key={section.title}
              className="nb-card p-6 animate-slide-up"
              style={{ opacity: 0 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-11 h-11 ${section.iconBg} nb-border rounded-lg flex items-center justify-center shrink-0`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-extrabold">{section.title}</h2>
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
