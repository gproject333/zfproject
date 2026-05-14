"use client";

import { CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui";

/**
 * Acceptance rate over *decided* applications only — accepted vs.
 * rejected. Pending applications (under review / needs changes / draft)
 * have no verdict yet and would deflate the rate if counted, so they
 * are reported separately instead.
 */
export default function AcceptanceRateCard({
  accepted,
  rejected,
  pending,
}: {
  accepted: number;
  rejected: number;
  pending: number;
}) {
  const decided = accepted + rejected;

  return (
    <Card className="p-6">
      <h3 className="font-extrabold text-lg mb-4 flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5 text-success" />
        معدل القبول
      </h3>
      {decided === 0 ? (
        <p className="text-sm text-muted-foreground">
          لم يُتَّخذ قرار في أي طلب بعد
          {pending > 0 ? ` — ${pending} طلب قيد المعالجة.` : "."}
        </p>
      ) : (
        <AcceptanceRate accepted={accepted} rejected={rejected} pending={pending} decided={decided} />
      )}
    </Card>
  );
}

function AcceptanceRate({
  accepted,
  rejected,
  pending,
  decided,
}: {
  accepted: number;
  rejected: number;
  pending: number;
  decided: number;
}) {
  const rate = Math.round((accepted / decided) * 100);
  return (
    <div className="space-y-4">
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className="text-4xl font-extrabold text-success tabular-nums leading-none">{rate}%</span>
        <span className="text-sm font-bold text-muted-foreground">
          من {decided} طلبًا اتُّخذ فيها قرار
        </span>
      </div>

      <div className="flex h-8 rounded-lg nb-border overflow-hidden">
        <div className="bg-success" style={{ width: `${rate}%` }} />
        <div className="bg-destructive" style={{ width: `${100 - rate}%` }} />
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm font-bold">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-success nb-border inline-block" />
          مقبول
          <span className="tabular-nums text-muted-foreground">{accepted}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-destructive nb-border inline-block" />
          مرفوض
          <span className="tabular-nums text-muted-foreground">{rejected}</span>
        </span>
      </div>

      {pending > 0 && (
        <p className="text-xs text-muted-foreground">
          {pending} طلب لم يُقيَّم بعد، غير محتسب ضمن المعدل.
        </p>
      )}
    </div>
  );
}
