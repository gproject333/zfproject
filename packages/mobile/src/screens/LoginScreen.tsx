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
      // Try TOTP first (authenticator app code), then fall back to a
      // backup code. Clerk rejects each strategy independently, so the
      // backup-code path will only run when TOTP comes back with
      // verification_failed or strategy_not_allowed.
      let attempt = await signIn!
        .attemptSecondFactor({ strategy: "totp", code })
        .catch((e) => {
          const err = e as { errors?: { code?: string }[] };
          if (err.errors?.[0]?.code === "strategy_not_allowed") return null;
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
            <Text style={styles.title}>التحقق بخطوتين</Text>
            <Text style={styles.subtitle}>
              أدخل الكود من تطبيق Authenticator أو أحد رموز الاحتياط
            </Text>

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
  hint: {
    fontSize: 12,
    color: "#737373",
    marginTop: 16,
    textAlign: "right",
    lineHeight: 18,
  },
});
