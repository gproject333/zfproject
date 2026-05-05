import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { arSA } from "@clerk/localizations";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Providers } from "./Providers";
import { TooltipProvider } from "@/components/ui/Tooltip";

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["200", "300", "400", "500", "700", "800", "900"],
  variable: "--font-tajawal",
  display: "swap",
});

export const metadata: Metadata = {
  title: "حاضنة الزيتونة | ZUJ Incubator",
  description:
    "منصة احتضان المشاريع الريادية ومشاريع التخرج — الجامعة الزيتونة الأردنية",
  keywords: [
    "حاضنة",
    "ريادة أعمال",
    "مشاريع تخرج",
    "الجامعة الزيتونة",
    "ZUJ",
    "incubator",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={arSA}>
      <html lang="ar" dir="rtl" className={`${tajawal.variable} h-full`} suppressHydrationWarning>
        <body
          className="min-h-full flex flex-col antialiased"
          style={{ fontFamily: "'Tajawal', sans-serif" }}
        >
          <ThemeProvider>
            <Providers>
              <TooltipProvider delayDuration={150}>
                <ConvexClientProvider>{children}</ConvexClientProvider>
              </TooltipProvider>
            </Providers>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
