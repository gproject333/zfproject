"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DevPage() {
  const router = useRouter();
  const user = useQuery(api.users.shared.currentUser);
  const makeMeAdmin = useMutation(api.users.dev.makeMeAdmin);
  const makeMeSupervisor = useMutation(api.users.dev.makeMeSupervisor);
  const makeMeStudent = useMutation(api.users.dev.makeMeStudent);
  const [msg, setMsg] = useState("");

  const run = async (fn: () => Promise<string>) => {
    try {
      const result = await fn();
      setMsg(result);
      setTimeout(() => router.push("/login-redirect"), 1000);
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "حدث خطأ");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl border-2 border-black p-8 w-full max-w-sm space-y-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <h1 className="text-xl font-extrabold text-center">🛠 Dev Setup</h1>

        {user === undefined ? (
          <p className="text-center text-gray-500 text-sm">جاري التحميل...</p>
        ) : user === null ? (
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">يجب تسجيل الدخول أولاً</p>
            <button
              onClick={() => router.push("/login")}
              className="w-full py-2 px-4 bg-black text-white font-bold rounded-xl"
            >
              تسجيل الدخول
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-center text-gray-500">
              مرحباً <span className="font-bold text-black">{user.name ?? user.email}</span>
              <br />
              الدور الحالي:{" "}
              <span className="font-bold text-blue-600">{user.role ?? "student"}</span>
            </p>

            <button
              onClick={() => run(makeMeAdmin)}
              className="w-full py-2.5 px-4 bg-red-500 text-white font-extrabold rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 transition-transform"
            >
              🔴 تحويل إلى Admin
            </button>
            <button
              onClick={() => run(makeMeSupervisor)}
              className="w-full py-2.5 px-4 bg-blue-500 text-white font-extrabold rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 transition-transform"
            >
              🔵 تحويل إلى مشرف
            </button>
            <button
              onClick={() => run(makeMeStudent)}
              className="w-full py-2.5 px-4 bg-green-500 text-white font-extrabold rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 transition-transform"
            >
              🟢 تحويل إلى طالب
            </button>

            {msg && (
              <p className="text-center text-sm font-bold text-green-600 bg-green-50 rounded-lg p-2">
                {msg}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
