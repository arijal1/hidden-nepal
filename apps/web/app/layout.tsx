import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Sans, DM_Mono, Mukta } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import "@/styles/globals.css";
import "mapbox-gl/dist/mapbox-gl.css";

// ─── Font Configuration ────────────────────────────────
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
  preload: true,
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-dm-sans",
  display: "swap",
  preload: true,
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
  preload: false,
});

const mukta = Mukta({
  subsets: ["devanagari", "latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mukta",
  display: "swap",
  preload: false,
});

// ─── Site Metadata ─────────────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://hiddennepal.com"
  ),
  title: {
    default: "Hidden Nepal — Discover Nepal's Best-Kept Secrets",
    template: "%s | Hidden Nepal",
  },
  description:
    "The ultimate digital companion for exploring Nepal. Discover hidden gems, plan AI-powered itineraries, explore trekking routes, and navigate Nepal like a local.",
  keywords: [
    "Nepal travel guide",
    "hidden places in Nepal",
    "Nepal trekking",
    "Nepal itinerary",
    "Nepal hidden gems",
    "Nepal backpacking",
    "Rara Lake",
    "Annapurna Circuit",
    "Everest Base Camp trek",
    "things to do in Nepal",
  ],
  authors: [{ name: "Hidden Nepal" }],
  creator: "Hidden Nepal",
  publisher: "Hidden Nepal",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://hiddennepal.com",
    siteName: "Hidden Nepal",
    title: "Hidden Nepal — Discover Nepal's Best-Kept Secrets",
    description:
      "AI-powered travel companion for Nepal. Hidden gems, trekking routes, itinerary planning.",
    images: [
      {
        url: "/og-images/default.jpg",
        width: 1200,
        height: 630,
        alt: "Hidden Nepal — Himalayan Horizons Await",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@hiddennepal",
    creator: "@hiddennepal",
    title: "Hidden Nepal — Discover Nepal's Best-Kept Secrets",
    description:
      "AI-powered travel companion for Nepal. Hidden gems, trekking routes, itinerary planning.",
    images: ["/og-images/default.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0f0a" },
    { media: "(prefers-color-scheme: light)", color: "#0a0f0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// ─── Root Layout ───────────────────────────────────────
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${cormorant.variable} ${dmSans.variable} ${dmMono.variable} ${mukta.variable}`}
    >
      <head>
        {/* Preconnect to external origins */}
        <link rel="preconnect" href="https://api.mapbox.com" />
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Mapbox GL CSS */}
        <link
          href="https://api.mapbox.com/mapbox-gl-js/v3.8.0/mapbox-gl.css"
          rel="stylesheet"
        />
      </head>
      <body className="bg-base-950 text-white antialiased">
        <ClerkProvider>
          {children}
          <Toaster
            theme="dark"
            toastOptions={{
              style: {
                background: "rgba(10,15,10,0.95)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "white",
                backdropFilter: "blur(20px)",
              },
            }}
          />
        </ClerkProvider>
      </body>
    </html>
  );
}
