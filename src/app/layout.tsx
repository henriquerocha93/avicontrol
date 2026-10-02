import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-context";
import { FloatingWidgets } from "@/components/floating/floating-widgets";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BIRDPRO • Gestão Profissional de Criatórios de Aves",
  description: "Plataforma profissional para gestão completa de criatórios: aves, anilhas, genealogia, reprodução, gaiolas, saúde, pedigree A4 e QR Codes.",
  keywords: ["criatório de aves", "gestão de plantel", "genealogia aves", "pedigree canário", "curió", "trinca ferro", "fob", "sispass", "anilhas"],
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans transition-colors duration-200">
        <ThemeProvider>
          <AuthProvider>
            {children}
            <FloatingWidgets />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
