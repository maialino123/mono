import type { Metadata } from "next";

import { Geist, Geist_Mono } from "next/font/google";

import "../index.css";
import { Providers } from "@/shared/providers";
import { CustomThemeMenu } from "@/widgets/custom-theme-menu";
import { Footer, Header } from "@/widgets/layout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "cyberk-flow",
  description: "cyberk-flow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <div className="grid h-svh grid-rows-[auto_1fr_auto]">
            <Header />
            <main className="relative flex-1">
              {children}
              <CustomThemeMenu />
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
