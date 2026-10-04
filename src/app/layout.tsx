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

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.birdpro.com.br';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "BIRDPRO • Software para Criatório de Aves | Gestão SISPASS, Anilhas & Pedigree",
    template: "%s | BIRDPRO",
  },
  description: "O software definitivo para gestão de criatórios de aves: controle de anilhas SISPASS e FOB, genealogia de até 5 gerações com consanguinidade Wright, reprodução e pedigree A4 com QR Code.",
  keywords: [
    "software para criatório de aves",
    "sistema para criador de pássaros",
    "gestão de criatório de aves",
    "controle de anilhas sispass",
    "importação sispass ibama",
    "genealogia de aves",
    "pedigree de aves com qr code",
    "cálculo consanguinidade aves wright",
    "software criatório curió",
    "sistema criatório trinca ferro",
    "manejo reprodutivo canário belga",
    "canário da terra",
    "coleiro papa capim",
    "bicudo azulão",
    "anilhas fob",
    "ficha de ave com qr code",
    "plataforma zootécnica de aves",
    "sistema de ovoscopia e postura",
    "sexagem dna aves",
    "criatório de passeriformes",
    "criatório de psitacídeos",
    "birdpro"
  ],
  authors: [{ name: "BIRDPRO Tecnologia Aviária", url: baseUrl }],
  creator: "BIRDPRO",
  publisher: "BIRDPRO",
  category: "technology",
  classification: "Software de Gestão Zootécnica para Aves",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: baseUrl,
    languages: {
      "pt-BR": baseUrl,
    },
  },
  openGraph: {
    title: "BIRDPRO • Software para Criatório de Aves | Gestão SISPASS, Anilhas & Pedigree",
    description: "Gestão zootécnica profissional completa: controle de anilhas SISPASS e FOB, genealogia de até 5 gerações com cálculo de consanguinidade Wright, reprodução e pedigree A4 com QR Code.",
    url: baseUrl,
    siteName: "BIRDPRO",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BIRDPRO • Software para Criatório de Aves",
      },
      {
        url: "/og-square.png",
        width: 512,
        height: 512,
        alt: "BIRDPRO Logo Oficial",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BIRDPRO • Software para Criatório de Aves | Gestão SISPASS & Pedigree",
    description: "Plataforma profissional em nuvem para criadores de aves: anilhas, genealogia, reprodução e pedigree oficial.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BirdPro",
  },
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" }
    ],
    shortcut: "/favicon.png",
    apple: "/apple-icon.png",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
  },
};

const jsonLdSoftwareApp = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "BIRDPRO",
  applicationCategory: "BusinessApplication",
  operatingSystem: "All, Web, Android, iOS, Windows, macOS",
  url: baseUrl,
  description: "Software em nuvem para gestão completa de criatórios de aves: controle de anilhas SISPASS e FOB, genealogia de até 5 gerações com cálculo de consanguinidade Wright, reprodução e pedigree A4 com QR Code.",
  image: `${baseUrl}/og-image.png`,
  screenshot: `${baseUrl}/og-image.png`,
  offers: {
    "@type": "Offer",
    price: "14.99",
    priceCurrency: "BRL",
    availability: "https://schema.org/InStock",
    url: `${baseUrl}/contratar`,
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "142",
    bestRating: "5",
    worstRating: "1",
  },
  featureList: [
    "Importação de relatórios SISPASS do IBAMA em 5 segundos",
    "Árvore genealógica de até 5 gerações com Coeficiente de Consanguinidade de Wright",
    "Emissão de Pedigree Oficial formato A4 e Crachá de Gaiola",
    "QR Code de autenticidade pública por ave para validação via celular",
    "Controle reprodutivo, postura, ovoscopia e alertas de anilhamento",
    "Prontuário sanitário e farmácia veterinária",
    "Acesso 100% em nuvem no celular, tablet e computador"
  ],
};

const jsonLdOrganization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "BIRDPRO",
  url: baseUrl,
  logo: `${baseUrl}/icon-512x512.png`,
  description: "Plataforma líder em tecnologia zootécnica e gestão digital de criatórios de aves no Brasil.",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    areaServed: "BR",
    availableLanguage: "Portuguese",
  },
};

const jsonLdWebsite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "BIRDPRO",
  url: baseUrl,
  description: "Software para Criatório de Aves • SISPASS, FOB, Genealogia e Pedigree",
  inLanguage: "pt-BR",
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
        {/* Schema.org Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSoftwareApp) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebsite) }}
        />
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
