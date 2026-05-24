"use client";

// TEMP diagnostic page — delete after reviewing the custom icons.
import { IdeaIcon, CodeProjectIcon, CampusIcon, JoinIcon } from "@/components/CustomIcons";
import { SOCIAL_PLATFORMS } from "@/lib/configs/socialPlatforms";

const ICONS = [
  { C: IdeaIcon, label: "فكرة ريادية", tone: "#1F5C2E" },
  { C: CodeProjectIcon, label: "مشروع IT", tone: "#C9A227" },
  { C: CampusIcon, label: "مشروع يخدم الجامعة", tone: "#2D7A3E" },
  { C: JoinIcon, label: "انضمّ إلينا", tone: "#1F5C2E" },
];

export default function DevIconsPreview() {
  return (
    <div dir="rtl" style={{ padding: 40, background: "#F5F9F5", minHeight: "100vh" }}>
      <h1 style={{ fontWeight: 800, marginBottom: 24 }}>معاينة الأيقونات المخصّصة</h1>

      <div style={{ display: "flex", gap: 32, marginBottom: 36, flexWrap: "wrap" }}>
        {ICONS.map(({ C, label, tone }) => (
          <div key={label} style={{ textAlign: "center" }}>
            <C style={{ width: 80, height: 80, color: tone }} />
            <p style={{ fontWeight: 700, marginTop: 8, fontSize: 13 }}>{label}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 40, flexWrap: "wrap" }}>
        {ICONS.map(({ C, label, tone }) => (
          <div
            key={label}
            style={{
              width: 60,
              height: 60,
              background: tone,
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <C style={{ width: 30, height: 30, color: "#fff" }} />
          </div>
        ))}
      </div>

      <h2 style={{ fontWeight: 800, marginBottom: 14, fontSize: 16 }}>التواصل الاجتماعي</h2>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", background: "#1F5C2E", padding: 16, borderRadius: 14 }}>
        {SOCIAL_PLATFORMS.map(({ key, label, icon: Icon }) => (
          <div key={key} title={label} style={{ textAlign: "center" }}>
            <div
              style={{
                width: 42,
                height: 42,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: 10,
                color: "#fff",
              }}
            >
              <Icon style={{ width: 18, height: 18 }} />
            </div>
            <p style={{ fontSize: 10, color: "#fff", marginTop: 4 }}>{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
