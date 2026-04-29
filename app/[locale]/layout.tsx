import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { ThemeProvider } from "next-themes";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { locales } from "@/core/lib/i18n/config";
import "../globals.css";

interface Props {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Finanzas Personales",
  description:
    "Una aplicación de finanzas personales construida con Next.js, TypeScript, Tailwind CSS y Supabase.",
};

export default async function RootLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!locales.includes(locale as (typeof locales)[number])) notFound();

  // Trae todos los mensajes del locale — ya los combinaste en request.ts
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <NextIntlClientProvider messages={messages}>
            {children}
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
