import type { Metadata } from "next";
import { Inter, DM_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import Providers from "@/providers/query-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { DynamicTheme } from "@/components/dynamic-theme";
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pencatat Keuangan Pribadi",
  description: "Kelola anggaran bulanan, lacak pengeluaran, dan raih target tabunganmu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${dmMono.variable} font-sans antialiased`}
      >
        <Providers>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <DynamicTheme />
            {children}
            <Toaster position="top-right" richColors />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
