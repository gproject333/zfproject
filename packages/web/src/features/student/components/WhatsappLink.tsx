"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { api } from "@smart-zuj/convex";
import { Button, Card, Input, InputOTP, Spinner, Switch } from "@/components/ui";
import { toast } from "@/lib/toast";

type Step = "enter-phone" | "enter-code" | "verified";

export function WhatsappLink() {
  const me = useQuery(api.users.shared.currentUser);
  const requestOtp = useMutation(api.whatsapp.requestWhatsappOtp);
  const verifyOtp = useMutation(api.whatsapp.verifyWhatsappOtp);
  const setOptOut = useMutation(api.whatsapp.setWhatsappOptOut);

  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<Step | null>(null);

  if (me === undefined) return null;

  const verified = me?.whatsappVerified === true;
  const effectiveStep: Step = step ?? (verified ? "verified" : "enter-phone");

  async function onRequestOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await requestOtp({ phone });
      toast.success("تم إرسال الرمز إلى واتساب");
      setStep("enter-code");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "تعذّر إرسال الرمز");
    } finally {
      setLoading(false);
    }
  }

  async function onVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await verifyOtp({ code });
      if (result.ok) {
        toast.success("تم التحقق من رقمك");
        setStep("verified");
      } else {
        toast.error(result.error);
        setCode("");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "تعذّر التحقق");
    } finally {
      setLoading(false);
    }
  }

  if (effectiveStep === "verified") {
    const optedOut = me?.whatsappOptOut === true;
    return (
      <Card className="p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-base">ربط الواتساب</h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/12 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3 h-3" />
                موثّق
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              ستصلك إشعارات المواعيد ونتائج الطلبات على واتساب.
            </p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          رقمك مرتبط:{" "}
          <span dir="ltr" className="font-mono text-foreground">
            {me?.phone}
          </span>
        </p>

        <div className="flex items-start gap-3 rounded-lg bg-muted/40 ds-border p-3">
          <Switch
            isSelected={!optedOut}
            onChange={(checked: boolean) => {
              void (async () => {
                try {
                  await setOptOut({ optOut: !checked });
                  toast.success(
                    checked
                      ? "تم تفعيل رسائل الواتساب"
                      : "تم إيقاف رسائل الواتساب",
                  );
                } catch (err) {
                  toast.error(
                    err instanceof Error ? err.message : "تعذّر حفظ التفضيل",
                  );
                }
              })();
            }}
            aria-label={optedOut ? "تفعيل رسائل الواتساب" : "إيقاف رسائل الواتساب"}
          />
          <div className="text-xs leading-relaxed">
            <p className="font-bold text-foreground">رسائل الواتساب</p>
            <p className="text-muted-foreground">
              عند الإيقاف، ستصلك الإشعارات داخل التطبيق فقط دون رسائل خارجية.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onPress={() => {
            setStep("enter-phone");
            setPhone("");
          }}
        >
          تغيير الرقم
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <MessageCircle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-base">ربط الواتساب</h3>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">
            رمز تحقّق من 6 أرقام عبر واتساب يفعّل إشعارات المواعيد ونتائج الطلبات.
          </p>
        </div>
      </div>

      {effectiveStep === "enter-phone" && (
        <form onSubmit={onRequestOtp} className="space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1.5">
              رقم الواتساب (مع رمز الدولة)
            </label>
            <Input
              fullWidth
              dir="ltr"
              placeholder="+962795551234"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              يقبل صيغة دولية ‎+962795551234‎ أو محلية ‎0795551234‎.
            </p>
          </div>
          <Button
            type="submit"
            variant="secondary"
            fullWidth
            isDisabled={loading || !phone}
          >
            {loading ? <Spinner size="sm" color="current" /> : "أرسل الرمز"}
          </Button>
        </form>
      )}

      {effectiveStep === "enter-code" && (
        <form onSubmit={onVerifyOtp} className="space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1.5">
              الرمز المرسل
            </label>
            <div className="flex justify-center" dir="ltr">
              <InputOTP
                value={code}
                onChange={setCode}
                maxLength={6}
                autoFocus
              >
                <InputOTP.Group>
                  <InputOTP.Slot index={0} />
                  <InputOTP.Slot index={1} />
                  <InputOTP.Slot index={2} />
                  <InputOTP.Slot index={3} />
                  <InputOTP.Slot index={4} />
                  <InputOTP.Slot index={5} />
                </InputOTP.Group>
              </InputOTP>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              type="submit"
              variant="secondary"
              fullWidth
              isDisabled={loading || code.length !== 6}
            >
              {loading ? <Spinner size="sm" color="current" /> : "تحقق"}
            </Button>
            <Button
              type="button"
              variant="outline"
              isDisabled={loading}
              onPress={() => {
                setStep("enter-phone");
                setCode("");
              }}
            >
              تغيير الرقم
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}
