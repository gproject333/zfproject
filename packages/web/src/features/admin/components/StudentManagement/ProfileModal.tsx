"use client";

import { X } from "lucide-react";
import { Card } from "@/components/ui";
import type { StudentProfile } from "./types";

interface ProfileModalProps {
  profileStudent: StudentProfile;
  setProfileStudent: (s: StudentProfile | null) => void;
}

export function ProfileModal({ profileStudent, setProfileStudent }: ProfileModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={() => setProfileStudent(null)}
    >
      <Card
        className="p-6 w-full max-w-md space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-lg">الملف الشخصي</h3>
          <button onClick={() => setProfileStudent(null)} className="hover:bg-foreground/5 rounded transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-info/20 ds-border flex items-center justify-center font-extrabold text-info text-2xl">
            {(profileStudent.name ?? profileStudent.email)[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-extrabold text-lg">{profileStudent.name ?? "—"}</p>
            <p className="text-sm text-muted-foreground">{profileStudent.email}</p>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <ProfileRow label="الرقم الجامعي" value={profileStudent.studentId} />
          <ProfileRow label="الكلية" value={profileStudent.college} />
          <ProfileRow label="التخصص" value={profileStudent.department} />
          <ProfileRow label="الهاتف" value={profileStudent.phone} />
          <ProfileRow label="LinkedIn" value={profileStudent.linkedinUrl} />
          <ProfileRow label="المشاريع المقدمة" value={String(profileStudent.applicationCount)} />
          <ProfileRow
            label="الحالة"
            value={profileStudent.isActive ? "فعّال" : "مجمّد"}
            valueClass={profileStudent.isActive ? "text-success font-bold" : "text-destructive font-bold"}
          />
          {profileStudent.createdAt && (
            <ProfileRow
              label="تاريخ التسجيل"
              value={new Date(profileStudent.createdAt).toLocaleDateString("ar-JO")}
            />
          )}
        </div>
      </Card>
    </div>
  );
}

function ProfileRow({
  label,
  value,
  valueClass = "",
}: {
  label: string;
  value?: string | null;
  valueClass?: string;
}) {
  return (
    <div className="flex justify-between gap-2 py-1.5 border-b border-border/40 last:border-0">
      <span className="text-muted-foreground font-medium">{label}</span>
      <span className={`font-semibold text-left ${valueClass}`}>{value ?? "—"}</span>
    </div>
  );
}
