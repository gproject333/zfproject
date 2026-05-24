"use client";

import type { ReactNode } from "react";
import {
  FileText,
  Users,
  Phone,
  Target,
  MapPin,
  GraduationCap,
  Tag,
} from "lucide-react";
import type { Doc } from "../../../../convex/_generated/dataModel";
import { Card } from "@/components/ui";

interface ProjectDetailsCardProps {
  app: Doc<"applications">;
}

/** A long-form narrative entry: a quiet label over readable prose. */
function Narrative({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <h4 className="text-[0.7rem] font-bold uppercase tracking-[0.08em] text-muted-foreground mb-1.5">
        {label}
      </h4>
      <p className="text-[0.95rem] leading-[1.75] text-foreground whitespace-pre-wrap break-words max-w-[68ch]">
        {value}
      </p>
    </div>
  );
}

/** A compact label/value pair for short, scannable facts. */
function Fact({
  icon,
  label,
  value,
  dir,
  wide,
}: {
  icon: ReactNode;
  label: string;
  value?: string;
  dir?: "ltr" | "rtl";
  wide?: boolean;
}) {
  if (!value) return null;
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <dt className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1">
        <span className="text-muted-foreground/70">{icon}</span>
        {label}
      </dt>
      <dd dir={dir} className="text-sm font-semibold text-foreground break-words">
        {value}
      </dd>
    </div>
  );
}

/**
 * Read-only "project details" card. Narrative fields (description,
 * problem, goals) render as readable prose blocks; short facts collect
 * into a recessed spec panel; team members get their own zone. Used on
 * the student details page and the supervisor review page.
 */
export default function ProjectDetailsCard({ app }: ProjectDetailsCardProps) {
  const categories = app.projectCategory ?? [];
  const team = app.teamMembers ?? [];
  const hasFacts =
    !!app.targetAudience ||
    !!app.phone ||
    (app.type === "it_graduation" && !!app.supervisor) ||
    (app.type === "university_entrepreneurial" && !!app.targetLocation) ||
    categories.length > 0;

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-center gap-2.5 mb-5">
        <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <FileText className="w-4 h-4" />
        </span>
        <h3 className="font-semibold text-base">تفاصيل المشروع</h3>
      </div>

      {/* Narrative — the substance of the application */}
      <div className="space-y-5">
        <Narrative label="وصف المشروع" value={app.description} />
        <Narrative label="المشكلة التي يعالجها" value={app.problemStatement} />
        <Narrative label="أهداف المشروع" value={app.projectGoals} />
        {app.type === "university_entrepreneurial" && (
          <Narrative label="الفائدة للجامعة" value={app.universityBenefit} />
        )}
      </div>

      {/* Short facts — a recessed spec panel */}
      {hasFacts && (
        <div className="mt-6 rounded-xl border border-foreground/[0.06] bg-background p-4 sm:p-5">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <Fact
              icon={<Target className="w-3.5 h-3.5" />}
              label="الجمهور المستهدف"
              value={app.targetAudience}
            />
            <Fact
              icon={<Phone className="w-3.5 h-3.5" />}
              label="رقم الهاتف"
              value={app.phone}
              dir="ltr"
            />
            {app.type === "it_graduation" && (
              <Fact
                icon={<GraduationCap className="w-3.5 h-3.5" />}
                label="المشرف الأكاديمي"
                value={app.supervisor}
              />
            )}
            {app.type === "university_entrepreneurial" && (
              <Fact
                icon={<MapPin className="w-3.5 h-3.5" />}
                label="المكان المستهدف"
                value={app.targetLocation}
              />
            )}
            {categories.length > 0 && (
              <div className="sm:col-span-2">
                <dt className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1.5">
                  <Tag className="w-3.5 h-3.5 text-muted-foreground/70" />
                  نوع المشروع
                </dt>
                <dd className="flex flex-wrap gap-1.5">
                  {categories.map((cat) => (
                    <span
                      key={cat}
                      className="ds-badge-soft bg-card text-foreground"
                    >
                      {cat}
                    </span>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {/* Team members */}
      {team.length > 0 && (
        <div className="mt-6 pt-5 border-t border-foreground/[0.07]">
          <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground mb-3">
            <Users className="w-3.5 h-3.5" />
            أعضاء الفريق
            <span className="text-muted-foreground/60">({team.length})</span>
          </h4>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {team.map((m, i) => (
              <li key={i} className="flex items-center gap-2.5 min-w-0">
                <span className="w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center shrink-0">
                  {m.name.trim().charAt(0) || "؟"}
                </span>
                <span className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold truncate">
                    {m.name}
                  </span>
                  <span
                    dir="ltr"
                    className="text-xs text-muted-foreground truncate text-right"
                  >
                    {m.phone}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
