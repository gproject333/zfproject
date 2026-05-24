import { StatusBar } from "expo-status-bar";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ConvexProvider, ConvexReactClient, useQuery } from "convex/react";
import { api } from "@smart-zuj/convex";
import { validatePhone } from "@smart-zuj/core";

const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;

if (!convexUrl) {
  // Fail loudly — the app is useless without a Convex deployment URL.
  throw new Error(
    "Missing EXPO_PUBLIC_CONVEX_URL. Copy it from packages/web/.env.local into packages/mobile/.env.",
  );
}

const convex = new ConvexReactClient(convexUrl, {
  unsavedChangesWarning: false,
});

/**
 * Smoke-test screen: proves the monorepo wiring works end-to-end on
 * React Native by (1) calling a public Convex query through the shared
 * `api` reference and (2) calling a pure validator from @smart-zuj/core.
 * Both come from the same workspace packages the web app consumes.
 */
function CollegesScreen() {
  const colleges = useQuery(api.colleges.list);

  // Pure-function demo: validatePhone is the same module the web's
  // student profile form uses — no copy, no duplication.
  const phoneTest = validatePhone("0791234567");

  if (colleges === undefined) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.muted}>جاري التحميل من Convex…</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>الكليات (من @smart-zuj/convex)</Text>

      {colleges.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>لا توجد كليات بعد</Text>
          <Text style={styles.muted}>
            شغّل seed mutation من /admin/colleges في تطبيق الويب
          </Text>
        </View>
      ) : (
        colleges.map((c) => (
          <View key={c._id} style={styles.card}>
            <Text style={styles.cardTitle}>{c.name}</Text>
          </View>
        ))
      )}

      <View style={styles.divider} />

      <Text style={styles.heading}>اختبار @smart-zuj/core</Text>
      <View style={styles.card}>
        <Text style={styles.label}>validatePhone(&quot;0791234567&quot;):</Text>
        <Text style={styles.value}>{phoneTest ?? "✓ رقم صالح"}</Text>
      </View>
    </ScrollView>
  );
}

export default function App() {
  return (
    <ConvexProvider client={convex}>
      <View style={styles.root}>
        <StatusBar style="auto" />
        <CollegesScreen />
      </View>
    </ConvexProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fafafa" },
  container: { padding: 16, paddingTop: 60, paddingBottom: 40 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  heading: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 12,
    textAlign: "right",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  cardTitle: { fontSize: 16, fontWeight: "600", textAlign: "right" },
  empty: {
    backgroundColor: "#fff7ed",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    gap: 8,
  },
  emptyTitle: { fontSize: 16, fontWeight: "700" },
  muted: { color: "#737373", textAlign: "center" },
  divider: { height: 1, backgroundColor: "#e5e5e5", marginVertical: 24 },
  label: { fontSize: 14, color: "#525252", textAlign: "right" },
  value: { fontSize: 16, fontWeight: "600", marginTop: 4, textAlign: "right" },
});
