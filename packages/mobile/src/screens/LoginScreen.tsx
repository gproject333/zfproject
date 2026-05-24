import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSignIn } from "@clerk/clerk-expo";

type Phase = "credentials" | "second_factor";

type SecondFactorMode = "totp" | "phone_code" | "email_code" | "backup_code";

/**
 * Human-readable label for each strategy so the UI can say "أدخل الكود
 * من رسالة SMS" vs "أدخل الكود من تطبيق Authenticator". Kept inline
 * because Clerk's own enum is not translated.
 */
const MODE_COPY: Record<SecondFactorMode, { title: string; hint: string }> = {
  totp: {
    title: "أدخل كود التحقق",
    hint: "افتح تطبيق Authenticator وأدخل الكود المؤقت (6 أرقام)",
  },
  phone_code: {
    title: "أدخل الكود من الرسالة النصية",
    hint: "أرسلنا رسالة SMS إلى رقمك المسجل",
  },
  email_code: {
    title: "أدخل الكود من البريد الإلكتروني",
    hint: "أرسلنا رمز التحقق إلى بريدك الإلكتروني",
  },
  backup_code: {
    title: "أدخل أحد رموز الاحتياط",
    hint: "استخدم أي رمز لم تستخدمه من قبل",
  },
};

/**
 * Two-phase Clerk sign-in:
 *
 *  1. credentials  — email + password. We call attemptFirstFactor with
 *     the password strategy explicitly so instances that have multiple
 *     first-factor strategies enabled still work.
 *  2. second_factor — after the password is accepted, if Clerk replies
 *     `needs_second_factor`, prompt for a 6-digit TOTP from the user's
 *     authenticator app (or a backup code).
 *
 * Real Clerk error messages are surfaced verbatim so we never hide a
 * real failure ("password incorrect", "code expired") behind a generic
 * fallback string.
 */
export default function LoginScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [phase, setPhase] = useState<Phase>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // Which 2FA strategy Clerk negotiated for this account. We pick a
  // primary mode (phone_code over totp, falling back to backup_code)
  // and remember it so submitSecondFactor passes the right strategy.
  const [mode, setMode] = useState<SecondFactorMode>("totp");
  // Raw strategy list from Clerk for the debug panel below. Shown only
  // on the 2FA screen so we (and the user) can confirm exactly which
  // strategies the account has enabled — saves a round-trip every time
  // someone says "but I get email codes, not SMS!"
  const [debugFactors, setDebugFactors] = useState<string[]>([]);

  function showError(e: unknown) {
    const err = e as { errors?: { message?: string }[]; message?: string };
    setError(
      err.errors?.[0]?.message ?? err.message ?? "حدث خطأ غير متوقع",
    );
  }

  async function submitCredentials() {
    if (!isLoaded) return;
    setError(null);
    setSubmitting(true);
    try {
      let attempt = await signIn.create({ identifier: email, password });
      if (attempt.status === "needs_first_factor") {
        attempt = await attempt.attemptFirstFactor({
          strategy: "password",
          password,
        });
      }
      if (attempt.status === "complete") {
        await setActive({ session: attempt.createdSessionId });
        return;
      }
      if (attempt.status === "needs_second_factor") {
        // Clerk publishes the configured second factors. SMS / email-
        // type strategies need `prepareSecondFactor` to actually send
        // the code; TOTP and backup codes work without it. We pick
        // whichever the account has — prefer phone_code (because the
        // user receives a fresh message), fall back to totp.
        const supported = signIn.supportedSecondFactors ?? [];
        setDebugFactors(supported.map((f) => f.strategy));

        // Strategy priority: phone_code → email_code → totp →
        // backup_code. The first two need `prepareSecondFactor` to
        // actually dispatch the SMS / email; totp is read straight
        // from the user's authenticator and needs no prepare.
        const phoneFactor = supported.find(
          (f) => f.strategy === "phone_code",
        );
        const emailFactor = supported.find(
          (f) => f.strategy === "email_code",
        );
        const totpFactor = supported.find((f) => f.strategy === "totp");

        if (phoneFactor && "phoneNumberId" in phoneFactor) {
          await signIn.prepareSecondFactor({
            strategy: "phone_code",
            phoneNumberId: phoneFactor.phoneNumberId as string,
          });
          setMode("phone_code");
        } else if (emailFactor && "emailAddressId" in emailFactor) {
          await signIn.prepareSecondFactor({
            strategy: "email_code",
            emailAddressId: emailFactor.emailAddressId as string,
          });
          setMode("email_code");
        } else if (totpFactor) {
          setMode("totp");
        } else {
          setMode("backup_code");
        }
        setPhase("second_factor");
        return;
      }
      setError(`تعذّر إكمال تسجيل الدخول — الحالة: ${attempt.status}`);
    } catch (e) {
      showError(e);
    } finally {
      setSubmitting(false);
    }
  }

  async function submitSecondFactor() {
    if (!isLoaded) return;
    setError(null);
    setSubmitting(true);
    try {
      // Submit with the strategy we negotiated when the password
      // attempt returned needs_second_factor. If the user's input
      // doesn't match that strategy (e.g. they typed a backup code on
      // the phone_code screen) we retry once with backup_code so they
      // don't have to start over.
      let attempt = await signIn!
        .attemptSecondFactor({ strategy: mode, code } as never)
        .catch((e) => {
          const err = e as { errors?: { code?: string }[] };
          // Only retry-with-backup-code on a code-mismatch shaped
          // error; rethrow anything else (rate-limited, expired, …)
          // so the real reason reaches the user.
          if (
            mode !== "backup_code" &&
            err.errors?.[0]?.code === "form_code_incorrect"
          ) {
            return null;
          }
          throw e;
        });
      if (!attempt) {
        attempt = await signIn!.attemptSecondFactor({
          strategy: "backup_code",
          code,
        });
      }
      if (attempt.status === "complete") {
        await setActive({ session: attempt.createdSessionId });
        return;
      }
      setError(`تعذّر التحقق — الحالة: ${attempt.status}`);
    } catch (e) {
      showError(e);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        {phase === "credentials" ? (
          <>
            <Text style={styles.title}>تسجيل الدخول</Text>
            <Text style={styles.subtitle}>
              استخدم نفس حساب الويب — Smart ZUJ
            </Text>

            <Text style={styles.label}>البريد الإلكتروني</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="#a3a3a3"
              editable={!submitting}
            />

            <Text style={styles.label}>كلمة المرور</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#a3a3a3"
              editable={!submitting}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable
              onPress={submitCredentials}
              disabled={!isLoaded || submitting || !email || !password}
              style={({ pressed }) => [
                styles.button,
                (pressed || submitting || !email || !password) &&
                  styles.buttonDisabled,
              ]}
            >
              {submitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>دخول</Text>
              )}
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.title}>{MODE_COPY[mode].title}</Text>
            <Text style={styles.subtitle}>{MODE_COPY[mode].hint}</Text>

            {debugFactors.length > 0 ? (
              <Text style={styles.debug}>
                Clerk supported factors: {debugFactors.join(", ")}
              </Text>
            ) : null}

            <Text style={styles.label}>الكود</Text>
            <TextInput
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              autoComplete="one-time-code"
              style={styles.input}
              placeholder="123456"
              placeholderTextColor="#a3a3a3"
              editable={!submitting}
              autoFocus
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable
              onPress={submitSecondFactor}
              disabled={!isLoaded || submitting || code.length < 6}
              style={({ pressed }) => [
                styles.button,
                (pressed || submitting || code.length < 6) &&
                  styles.buttonDisabled,
              ]}
            >
              {submitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>تحقق</Text>
              )}
            </Pressable>

            <Pressable
              onPress={() => {
                setPhase("credentials");
                setCode("");
                setError(null);
              }}
              style={styles.linkBtn}
              disabled={submitting}
            >
              <Text style={styles.linkText}>← الرجوع لتسجيل الدخول</Text>
            </Pressable>
          </>
        )}

        <Text style={styles.hint}>
          هذه شاشة بسيطة لتجربة Convex auth من React Native — الأنواع
          المتقدمة (Google, SSO, Magic Link) موجودة في الويب فقط حالياً.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#fafafa",
    justifyContent: "center",
    padding: 16,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    gap: 8,
  },
  title: { fontSize: 24, fontWeight: "700", textAlign: "right" },
  subtitle: {
    fontSize: 14,
    color: "#737373",
    marginBottom: 16,
    textAlign: "right",
  },
  label: {
    fontSize: 14,
    color: "#525252",
    marginTop: 8,
    textAlign: "right",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d4d4d4",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: "white",
    textAlign: "right",
  },
  button: {
    backgroundColor: "#212122",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    marginTop: 16,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "white", fontWeight: "600", fontSize: 16 },
  error: {
    color: "#dc2626",
    fontSize: 14,
    marginTop: 8,
    textAlign: "right",
  },
  linkBtn: { alignSelf: "flex-end", padding: 8, marginTop: 8 },
  linkText: { color: "#525252", fontSize: 14 },
  debug: {
    fontSize: 11,
    color: "#a3a3a3",
    backgroundColor: "#f5f5f5",
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  hint: {
    fontSize: 12,
    color: "#737373",
    marginTop: 16,
    textAlign: "right",
    lineHeight: 18,
  },
});
