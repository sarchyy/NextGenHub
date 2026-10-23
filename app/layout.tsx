import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { siteUrl } from "@/lib/site";
import "./globals.css";

// "latin-ext" sadrži č, ć, š, đ, ž; bez njega ta slova dolaze iz drugog fonta.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
});

const title = "NextGen HUB Kakanj | IT zajednica i besplatna edukacija";
const description =
  "NextGen HUB Kakanj okuplja početnike, iskusne developere i mentore. Besplatna edukacija, radionice i coworking prostor u Kaknju.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s | NextGen HUB Kakanj",
  },
  description,
  applicationName: "NextGen HUB",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "bs_BA",
    siteName: "NextGen HUB Kakanj",
    title,
    description,
    url: "/",
    images: [{ url: "/hero.jpg", width: 1200, height: 628, alt: "NextGen HUB Kakanj" }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/hero.jpg"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="bs"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}