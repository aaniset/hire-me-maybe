import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers";
import { siteConfig } from "@/config/site";
import SessionWrapper from "@/components/sessionWrapper";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

//   title: {
//     default: siteConfig.name,
//     template: `%s - ${siteConfig.name}`,
//   },
//   metadataBase: new URL(siteConfig.url),
//   description: siteConfig.description,
//   keywords: [
//     "Next.js",
//     "React",
//     "Tailwind CSS",
//     "Server Components",
//     "Radix UI",
//   ],
//   authors: [
//     {
//       name: "shadcn",
//       url: "https://shadcn.com",
//     },
//   ],
//   creator: "shadcn",
//   openGraph: {
//     type: "website",
//     locale: "en_US",
//     url: siteConfig.url,
//     title: siteConfig.name,
//     description: siteConfig.description,
//     siteName: siteConfig.name,
//     images: [
//       {
//         url: siteConfig.ogImage,
//         width: 1200,
//         height: 630,
//         alt: siteConfig.name,
//       },
//     ],
//   },
//   twitter: {
//     card: "summary_large_image",
//     title: siteConfig.name,
//     description: siteConfig.description,
//     images: [siteConfig.ogImage],
//     creator: "@shadcn",
//   },
//   icons: {
//     icon: "/favicon.ico",
//     shortcut: "/favicon-16x16.png",
//     apple: "/apple-touch-icon.png",
//   },
//   manifest: `${siteConfig.url}/site.webmanifest`,
// };
export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  metadataBase: new URL(siteConfig.url),
  description: siteConfig.description,
  keywords: [
    "Job Application Tracker",
    "Email Sync",
    "Job Search",
    "Career Management",
    "AI-powered",
    "Automated Job Tracking",
    "Application Centralization",
    "Job Search Efficiency",
    "Career Tools",
    "Job Application Management",
  ],
  authors: [
    {
      name: "Deep Anisetty",
      url: "https://tracker.techwithdeep.com",
    },
  ],
  creator: "Deep Anisetty",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "Hire Me Maybe - AI-powered Job Application Tracker",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: "@anisettyanudeep",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: `${siteConfig.url}/site.webmanifest`,
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          // enableSystem
          disableTransitionOnChange
        >
          <SessionWrapper>{children} </SessionWrapper>
          <Toaster />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
