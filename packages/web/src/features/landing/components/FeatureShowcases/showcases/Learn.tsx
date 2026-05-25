"use client";

import {
  BookOpen,
  PlayCircle,
  Compass,
  type LucideIcon,
} from "lucide-react";
import { FeatureSection, MockupFrame, MockupHeader } from "../index";

/* ─────────────────────── Showcase 3: Learn ─────────────────────── */

export function LearnShowcase({ ctaHref }: { ctaHref: string }) {
  return (
    <FeatureSection
      headline="مكتبة معرفية"
      highlight="بإشراف أكاديمي"
      description="مكتبة رقمية تضم مقالات وأدلة ووسائط تعليمية يُعدّها أعضاء هيئة التدريس والمشرفون الأكاديميون وفق متطلبات السياق الأكاديمي في الجامعة."
      bullets={[
        { icon: BookOpen, label: "مقالات متخصصة في إعداد المشاريع وخطط العمل" },
        { icon: PlayCircle, label: "مواد تعليمية في ريادة الأعمال ونماذج العمل" },
        { icon: Compass, label: "دليل تأسيس المشاريع الناشئة في المملكة الأردنية الهاشمية" },
      ]}
      cta="الاطلاع على المكتبة"
      ctaHref={ctaHref}
      mockupSide="right"
      mockup={<LearnMockup />}
    />
  );
}

function LearnMockup() {
  return (
    <MockupFrame>
      <MockupHeader title="المكتبة والدليل الريادي" subtitle="مواد منشورة بإشراف هيئة التدريس" />
      <ul className="divide-y divide-border/40">
        <ArticleRow
          icon={BookOpen}
          tone="text-info"
          tag="مقال"
          title="معايير إعداد وصف المشروع الأكاديمي"
          author="مشرف الحاضنة"
          readTime="٥ دقائق قراءة"
        />
        <ArticleRow
          icon={PlayCircle}
          tone="text-status-modification"
          tag="فيديو"
          title="نموذج العمل التجاري في المشاريع الطلابية"
          author="الدليل الريادي"
          readTime="١٢ دقيقة"
        />
        <ArticleRow
          icon={Compass}
          tone="text-secondary"
          tag="دورة"
          title="تأسيس الشركات الناشئة في المملكة الأردنية الهاشمية"
          author="الدليل الريادي"
          readTime="٨ وحدات"
        />
      </ul>
      <div className="px-6 py-4 border-t border-border/40 bg-muted/30 flex items-center justify-between">
        <div className="text-xs">
          <span className="font-extrabold text-foreground">مكتبة محدَّثة</span>
          <span className="text-muted-foreground font-medium"> · مقالات · مواد مرئية · دورات · مراجع</span>
        </div>
        <span className="text-xs font-extrabold text-primary">عرض الكل ←</span>
      </div>
    </MockupFrame>
  );
}

function ArticleRow({
  icon: Icon,
  tone,
  tag,
  title,
  author,
  readTime,
}: {
  icon: LucideIcon;
  tone: string;
  tag: string;
  title: string;
  author: string;
  readTime: string;
}) {
  return (
    <li className="flex items-start gap-4 p-4 hover:bg-muted/30 transition-colors">
      <div className={`w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center shrink-0 ${tone}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-extrabold text-foreground/55 tracking-wide uppercase">
            {tag}
          </span>
          <span className="w-1 h-1 rounded-full bg-foreground/30" />
          <span className="text-[10px] font-bold text-muted-foreground">{readTime}</span>
        </div>
        <p className="text-sm font-bold text-foreground leading-snug line-clamp-2">{title}</p>
        <p className="text-xs text-muted-foreground font-medium mt-1">{author}</p>
      </div>
    </li>
  );
}
