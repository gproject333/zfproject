"use client";

import { I18nProvider, RouterProvider } from "@heroui/react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter();
  return (
    <I18nProvider locale="ar-SA">
      <RouterProvider navigate={(path) => router.push(path)}>
        {children}
      </RouterProvider>
    </I18nProvider>
  );
}
