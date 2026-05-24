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

/**
 * Email + password sign-in via Clerk. We do this in two steps because
 * Clerk's first-factor API is async (it may also return MFA strategies
 * for some accounts): `create` starts the attempt, `setActive` commits
 * the session once a `complete` status comes back.
 *
 * Anything other than `complete` is surfaced as a generic message —
 * the demo isn't meant to replicate the web's full sign-in UX.
 */
export default function LoginScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit() {
    if (!isLoaded) return;
    setError(null);
    setSubmitting(true);
    try {
      // Clerk's `signIn.create` may return `complete` immediately (single
      // password factor) or `needs_first_factor` when multiple strategies
      // are enabled on the instance. In the second case we explicitly
      // pick the password strategy so the existing Clerk users — who
      // signed up on the web with email + password — can still get in.
      let attempt = await signIn.create({ identifier: email, password });
      if (attempt.status === "needs_first_factor") {
        attempt = await attempt.attemptFirstFactor({
          strategy: "password",
          password,
        });
      }
      if (attempt.status === "complete") {
        await setActive({ session: attempt.createdSessionId });
      } else {
        setError(`تعذّر إكمال تسجيل الدخول — الحالة: ${attempt.status}`);
      }
    } catch (e: unknown) {
      // Clerk throws structured errors with a `clerkError: true` flag;
      // their `errors[0].message` is the human-readable reason. Fall
      // back to the generic message only when the shape doesn't match.
      const err = e as { errors?: { message?: string }[]; message?: string };
      const msg =
        err.errors?.[0]?.message ??
        err.message ??
        "بيانات الدخول غير صحيحة";
      setError(msg);
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
          onPress={onSubmit}
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

        <Text style={styles.hint}>
          هذه شاشة بسيطة لتجربة Convex auth من React Native — الأنواع
          المتقدمة (Google, SSO, MFA) موجودة في الويب فقط حالياً.
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
  hint: {
    fontSize: 12,
    color: "#737373",
    marginTop: 16,
    textAlign: "right",
    lineHeight: 18,
  },
});
