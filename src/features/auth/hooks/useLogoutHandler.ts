"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";

export function useLogoutHandler(redirectTo: string) {
  const router = useRouter();
  const { signOut } = useClerk();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      router.push(redirectTo);
    } finally {
      setIsLoggingOut(false);
      setShowConfirm(false);
    }
  }, [signOut, router, redirectTo]);

  return { showConfirm, setShowConfirm, isLoggingOut, handleLogout };
}
