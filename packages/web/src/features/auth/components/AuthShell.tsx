"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { buttonVariants } from "@/components/ui";
import OliveLogo from "@/components/OliveLogo";

/**
 * Shared shell for the public auth surfaces (login, register, forgot,
 * OTP-verify). Renders the bg-pattern background, the "back to home"
 * link, the brand header (icon + title + subtitle), and leaves a
 * children slot for the form card.
 *
 * Per DESIGN.md "Trust over flash", no decorative floating shapes, no
 * macOS-window gimmicks. The brand icon is soft (ds-shadow-sm, no
 * thick border) to match the rest of the soft surface.
 */
export default function AuthShell({
  title,
  subtitle,
  maxWidth = "md",
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  maxWidth?: "md" | "lg";
  children: ReactNode;
  footer?: ReactNode;
}) {
  const widthClass = maxWidth === "lg" ? "max-w-lg" : "max-w-md";
  return (
    <div className="min-h-screen bg-pattern flex items-center justify-center p-4 relative">
      <Link
        href="/"
        className={`${buttonVariants({ variant: "outline", size: "sm" })} absolute top-5 right-5 z-20 group`}
      >
        <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-0.5" />
        <span>الصفحة الرئيسية</span>
      </Link>

      <div className={`w-full ${widthClass} animate-scale-in`}>
        <header className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 mx-auto">
            <OliveLogo className="w-full h-full" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-2 text-foreground">{title}</h1>
          <p className="text-sm font-medium text-muted-foreground">{subtitle}</p>
        </header>

        {children}

        {footer && <div className="mt-6 text-center">{footer}</div>}
      </div>
    </div>
  );
}
