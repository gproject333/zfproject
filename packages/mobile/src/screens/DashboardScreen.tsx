import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import { usePaginatedQuery, useQuery } from "convex/react";
import { api } from "@smart-zuj/convex";

/**
 * Signed-in landing screen for students. Demonstrates two
 * auth-protected Convex queries running natively from React Native:
 *
 *  - `users.shared.currentUser` returns the authenticated user record
 *    (or null until the JWT round-trips), so we can show their name + role.
 *  - `applications.student.myApplications` returns the user's own
 *    applications via `getOptionalUser` + index lookup. The server is
 *    the single source of truth — there is no client-side filter by id.
 *
 * Sign-out is a single Clerk call. The provider clears the JWT and
 * Convex's subscription tears down automatically.
 */
export default function DashboardScreen() {
  const { signOut } = useAuth();
  const user = useQuery(api.users.shared.currentUser);
  const { results: applications, status } = usePaginatedQuery(
    api.applications.student.myApplications,
    {},
    { initialNumItems: 20 },
  );

  if (user === undefined) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.muted}>جاري المصادقة مع Convex…</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => signOut()} style={styles.signOutBtn}>
          <Text style={styles.signOutText}>تسجيل خروج</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.welcome}>
            أهلاً {user?.name ?? "أيها المستخدم"}
          </Text>
          <Text style={styles.role}>
            الدور: {translateRole(user?.role)}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <Text style={styles.heading}>طلباتي</Text>

      {status === "LoadingFirstPage" ? (
        <ActivityIndicator />
      ) : applications.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>لا توجد طلبات بعد</Text>
          <Text style={styles.muted}>
            افتح تطبيق الويب وأنشئ طلباً — سيظهر هنا فوراً.
          </Text>
        </View>
      ) : (
        applications.map((a) => (
          <View key={a._id} style={styles.card}>
            <Text style={styles.cardTitle}>{a.projectName}</Text>
            <Text style={styles.cardMeta}>
              {translateType(a.type)} · {translateStatus(a.status)}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

function translateRole(role: string | undefined | null): string {
  if (!role) return "غير محدد";
  if (role === "student") return "طالب";
  if (role === "supervisor") return "مشرف";
  if (role === "admin") return "مسؤول";
  if (role === "sponsor") return "ممول";
  return role;
}

function translateType(type: string): string {
  if (type === "entrepreneurial_idea") return "فكرة ريادية";
  if (type === "it_graduation") return "مشروع تخرج";
  if (type === "university_entrepreneurial") return "ريادة جامعية";
  return type;
}

function translateStatus(status: string): string {
  if (status === "draft") return "مسودة";
  if (status === "under_review") return "قيد المراجعة";
  if (status === "needs_modification") return "بحاجة لتعديل";
  if (status === "accepted") return "مقبول";
  if (status === "rejected") return "مرفوض";
  return status;
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingTop: 60, paddingBottom: 40, gap: 4 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  headerRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
  },
  welcome: { fontSize: 22, fontWeight: "700", textAlign: "right" },
  role: { fontSize: 14, color: "#737373", textAlign: "right" },
  signOutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#d4d4d4",
    borderRadius: 8,
  },
  signOutText: { fontSize: 13, color: "#525252" },
  divider: { height: 1, backgroundColor: "#e5e5e5", marginVertical: 16 },
  heading: {
    fontSize: 18,
    fontWeight: "600",
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
    gap: 4,
  },
  cardTitle: { fontSize: 16, fontWeight: "600", textAlign: "right" },
  cardMeta: { fontSize: 13, color: "#737373", textAlign: "right" },
  empty: {
    backgroundColor: "#fff7ed",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    gap: 8,
  },
  emptyTitle: { fontSize: 16, fontWeight: "700" },
  muted: { color: "#737373", textAlign: "center" },
});
