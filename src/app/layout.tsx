import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SmartRPS Builder - AI RPS Generator OBE",
  description:
    "Alat pembuat Rencana Pembelajaran Semester (RPS) berbasis Outcome-Based Education (OBE) yang menggunakan AI untuk menghasilkan struktur JSON lengkap sesuai standar kurikulum perguruan tinggi.",
  keywords: [
    "RPS",
    "Rencana Pembelajaran Semester",
    "OBE",
    "Outcome-Based Education",
    "Kurikulum",
    "Perguruan Tinggi",
    "AI",
    "CPL",
    "CPMK",
  ],
  authors: [{ name: "SmartRPS Builder" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "SmartRPS Builder - AI RPS Generator OBE",
    description:
      "Generate RPS berbasis OBE secara otomatis dengan AI. Output JSON lengkap dengan CPL, CPMK, taksonomi Bloom, matriks mingguan M1-M16.",
    siteName: "SmartRPS Builder",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SmartRPS Builder",
    description: "AI RPS Generator berbasis OBE untuk perguruan tinggi.",
  },
};

import { ThemeProvider } from "@/components/theme-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
