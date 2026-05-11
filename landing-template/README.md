# Landing Page Template — حاضنة الزيتونة

نسخة Standalone من اللاندنج بيج الخاصة بمشروع "حاضنة الزيتونة" (ZUJ Incubator)،
مأخوذة من `src/features/landing/components/` في المشروع الأصلي
(Next.js + Tailwind v4 + HeroUI + Convex). الهدف منها تسهيل تطوير وتحسين
التصميم بمعزل عن الـ backend والـ build pipeline.

## تشغيلها

افتح `index.html` مباشرة في المتصفح، أو شغّل سيرفر بسيط:

```bash
# من داخل هذا المجلد
python3 -m http.server 8000
# ثم افتح http://localhost:8000
```

## الملفات

- `index.html` — الصفحة الكاملة (HTML + CSS + JS مدمج).
- `team.png`, `about-team.png` — صور تستخدمها أقسام Hero و About.

## التقنيات المستخدمة

- **Tailwind CSS** عبر Play CDN (للتطوير السريع فقط).
- **Lucide Icons** عبر CDN.
- **Tajawal** من Google Fonts (خط عربي).
- متغيرات CSS (`--primary`, `--secondary`, ...) مطابقة لـ `src/app/globals.css`
  في المشروع الأصلي، لضمان توافق الألوان عند الدمج.
- لا توجد أي اعتماديات على React/Convex/Clerk — كل شيء HTML/CSS/JS عادي.

## الأقسام (Sections)

1. شريط إعلانات متحرك (Announcement bar)
2. Navbar مع شعار الزيتونة وأزرار الدخول
3. Hero — العنوان الرئيسي + الصورة
4. Hero Carousel — بانر إعلاني (في المشروع الأصلي يديره المشرف)
5. Features — ثلاث مسارات احتضان
6. How it works — سلايدر من 4 خطوات (مع أسهم ونقاط)
7. About — من نحن + ٣ أركان (رؤية/رسالة/ما نقدّمه)
8. Testimonials — ٣ شهادات طلاب
9. Partners — شريط متحرك للشركاء
10. FAQ — أسئلة شائعة (accordion)
11. Final CTA — دعوة للتسجيل
12. Footer — مع روابط تواصل اجتماعي

## ملاحظات للتطوير

- الروابط (`href="#"`) ستُستبدل لاحقاً بـ `/login`، `/register`، `/student` ... عند
  الدمج في المشروع.
- زر تبديل الوضع (Dark/Light) شغّال — يبدّل بإضافة class `dark` على `<html>`.
- النصوص العربية موجودة inline في الـ HTML، يمكن تعديلها مباشرة.
- إذا أردت إضافة صور للشركاء بدل النصوص، استبدل `<span>` بـ `<img>` داخل
  `.animate-marquee`.

## بعد التعديل

عند الانتهاء من التحسينات، أعد إرسال هذا المجلد كاملاً (أو فقط `index.html`)
وسيتم دمج التغييرات في المكونات الأصلية داخل `src/features/landing/components/`.
