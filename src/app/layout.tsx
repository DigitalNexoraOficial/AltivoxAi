import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/components/providers/I18nProvider";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.altivoxai.es"),
  title: "AltivoxAi | Chatbots, Automatización e IA para pymes",
  description:
    "Agencia de IA para pymes: chatbot web en 7 días, automatización de leads y agentes conversacionales. Precio cerrado. Primera llamada gratis.",
  openGraph: {
    title: "AltivoxAi",
    description:
      "Chatbots, automatización de leads y agentes de IA con precio cerrado para pymes.",
    url: "https://www.altivoxai.es",
    siteName: "AltivoxAi",
    type: "website",
    images: [{ url: "/favicon.png" }],
  },
  twitter: {
    card: "summary",
    title: "AltivoxAi",
    description: "IA y automatización para pymes. Precio cerrado.",
  },
  icons: {
    icon: [{ url: "/favicon.png" }, { url: "/favicon.ico" }],
    apple: "/favicon.png",
  },
  alternates: { canonical: "https://www.altivoxai.es" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={sans.variable}>
      <body className="min-h-screen bg-ink font-sans text-white antialiased">
        <div className="grain" aria-hidden />
        <I18nProvider>
          <SmoothScrollProvider>{children}</SmoothScrollProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
