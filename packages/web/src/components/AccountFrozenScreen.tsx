"use client";

import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { Lock } from "lucide-react";

/**
 * Full-screen block shown when the signed-in user's account has been frozen
 * by an admin (`isActive === false`). The backend already rejects all their
 * protected calls — this gives a clear explanation plus a clean sign-out
 * instead of a silent loop or a cryptic error toast.
 */
export default function AccountFrozenScreen() {
  const router = useRouter();
  const { signOut } = useClerk();

  return (
    <div className="min-h-screen bg-pattern flex items-center justify-center px-4">
      <div className="max-w-md w-full rounded-2xl bg-card ds-border p-8 text-center space-y-5 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-destructive/12 text-destructive flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-extrabold">حسابك مجمّد</h2>
          <p className="text-sm text-muted-foreground font-medium leading-relaxed">
            تم تجميد حسابك من قِبل إدارة المنصّة. إذا كنت تعتقد أن هذا خطأ، يُرجى
            التواصل مع الإدارة لإعادة تفعيله.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void signOut(() => router.push("/login"))}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-primary text-primary-foreground font-bold text-sm ds-shadow-sm hover:bg-accent transition-colors w-full"
        >
          تسجيل الخروج
        </button>
      </div>
    </div>
  );
}
