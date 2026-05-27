"use client";

import { MessageCircle, ShieldCheck, Zap, CheckCheck } from "lucide-react";
import { FeatureSection, MockupFrame, MockupHeader } from "../index";

/* ─────────────────────── Showcase: WhatsApp notifications ─────────────────────── */

export function WhatsappShowcase({ ctaHref }: { ctaHref: string }) {
  return (
    <FeatureSection
      headline="إشعارات فورية على"
      highlight="واتساب"
      description="بمجرد ربط الطالب لرقمه عبر رمز تحقق آمن، تصل تحديثات الطلب وإشعارات اللقاءات مباشرة إلى محادثة واتساب — بدون انتظار فتح الموقع أو متابعة البريد الإلكتروني."
      bullets={[
        { icon: ShieldCheck, label: "تفعيل الرقم برمز تحقق مكوّن من 6 أرقام عبر واتساب" },
        { icon: Zap, label: "إشعار فوري عند جدولة لقاء أو صدور قرار من المشرف" },
        { icon: CheckCheck, label: "إمكانية الإيقاف في أي وقت مع بقاء الإشعارات داخل المنصة" },
      ]}
      cta="ابدأ التفعيل"
      ctaHref={ctaHref}
      mockupSide="left"
      mockup={<WhatsappMockup />}
    />
  );
}

function WhatsappMockup() {
  return (
    <MockupFrame>
      <MockupHeader
        title="محادثة واتساب"
        subtitle="إشعارات حاضنة الزيتونة"
      />
      <div
        className="p-5 space-y-3"
        style={{
          background:
            "linear-gradient(180deg, rgba(229,221,213,0.12) 0%, rgba(229,221,213,0.05) 100%)",
        }}
      >
        <ChatBubble
          time="٠٩:٤٢"
          text="رمز التحقق: 482031\nصالح لمدة 10 دقائق."
        />
        <ChatBubble
          time="١٢:١٥"
          text="📅 تم جدولة لقاء جديد\nالموعد: الخميس ٢٨ مايو ٢٠٢٦، ١٠:٠٠ ص\nمع: د. أحمد العلي"
          highlight
        />
        <ChatBubble
          time="١٦:٠٣"
          text='🎉 تمت الموافقة على طلبك "نظام إدارة المخزون الذكي".'
        />
        <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium">متصل بواتساب — instance zuj</span>
        </div>
      </div>
    </MockupFrame>
  );
}

function ChatBubble({
  text,
  time,
  highlight = false,
}: {
  text: string;
  time: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex">
      <div
        className={`relative max-w-[85%] ms-auto rounded-2xl rounded-tr-md px-4 py-2.5 text-sm whitespace-pre-line leading-relaxed ${
          highlight
            ? "bg-emerald-50 dark:bg-emerald-500/10 text-foreground ds-border border-emerald-500/30"
            : "bg-card text-foreground ds-border"
        }`}
      >
        <div className="font-medium">{text}</div>
        <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
          <span>{time}</span>
          <CheckCheck className="w-3 h-3 text-emerald-500" />
        </div>
        <MessageCircle className="absolute -bottom-2 -end-2 w-4 h-4 text-emerald-500/70" />
      </div>
    </div>
  );
}
