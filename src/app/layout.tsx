import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-context";
import { FloatingWidgets } from "@/components/floating/floating-widgets";
import { PWAProvider } from "@/components/pwa/pwa-installer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.birdpro.com.br'),
  title: "BIRDPRO • Gestão Profissional de Criatórios de Aves",
  description: "Plataforma profissional para gestão completa de criatórios: aves, anilhas, genealogia, reprodução, gaiolas, saúde, pedigree A4 e QR Codes.",
  keywords: ["criatório de aves", "gestão de plantel", "genealogia aves", "pedigree canário", "curió", "trinca ferro", "fob", "sispass", "anilhas"],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'BirdPro',
  },
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' }
    ],
    shortcut: '/favicon.png',
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: "BIRDPRO • Gestão Profissional de Criatórios de Aves",
    description: "Plataforma profissional para gestão completa de criatórios: aves, anilhas, genealogia de até 5 gerações com cálculo de consanguinidade, reprodução e pedigree A4 com QR Code.",
    url: "https://www.birdpro.com.br",
    siteName: "BIRDPRO",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/og-square.png",
        width: 512,
        height: 512,
        alt: "BIRDPRO Logo Oficial",
      },
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BIRDPRO • Gestão Zootécnica & Genética Aviária",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BIRDPRO • Gestão Profissional de Criatórios de Aves",
    description: "Plataforma profissional para gestão completa de criatórios de aves, anilhas e pedigree oficial.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <head>
        <meta name="theme-color" content="#00c853" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="BirdPro" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans transition-colors duration-200">
        <ThemeProvider>
          <AuthProvider>
            <PWAProvider>
              {children}
              <FloatingWidgets />
            </PWAProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
