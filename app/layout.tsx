import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppToaster } from "@/components/ui/app-toast";
import { QueryProvider } from "@/components/providers/query-provider";

const metadataBase = (() => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!appUrl) {
    return new URL("http://localhost:3000");
  }

  try {
    return new URL(appUrl);
  } catch {
    return new URL("http://localhost:3000");
  }
})();
const iconVersion = "20260311b";

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: "Sociality | Connect, Share, Inspire",
    template: "%s | Sociality",
  },
  description:
    "Sociality adalah tempat untuk berbagi momen, menemukan inspirasi, dan terhubung dengan komunitasmu.",
  applicationName: "Sociality",
  category: "social networking",
  keywords: [
    "Sociality",
    "social media",
    "share moments",
    "community",
    "photo sharing",
    "networking",
  ],
  alternates: {
    canonical: "/",
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  icons: {
    icon: [
      { url: `/icon.svg?v=${iconVersion}`, type: "image/svg+xml" },
      { url: `/favicon.ico?v=${iconVersion}` },
    ],
    shortcut: [`/favicon.ico?v=${iconVersion}`],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Sociality | Connect, Share, Inspire",
    description:
      "Bagikan cerita terbaikmu, temukan teman baru, dan bangun koneksi yang bermakna di Sociality.",
    url: "/",
    siteName: "Sociality",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/icon.svg",
        width: 512,
        height: 512,
        alt: "Sociality icon",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Sociality | Connect, Share, Inspire",
    description:
      "Bagikan cerita terbaikmu, temukan teman baru, dan bangun koneksi di Sociality.",
    images: ["/icon.svg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#6936f2",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="bg-black">
      <body className="antialiased">
        <QueryProvider>{children}</QueryProvider>
        <AppToaster />
      </body>
    </html>
  );
}
