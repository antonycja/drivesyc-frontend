import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import BaseLayout from "@/components/layout/baseLayout";
import { AuthProvider } from "@/components/auth/utils/authProvider";
import { TestProvider } from "@/context/TestContext";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DriveSync - Modern Driving School Management",
  description: "Connect driving schools with learners for a better driving education experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <TestProvider>
            <BaseLayout className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-gradient-to-br from-background via-background to-accent/10 ">
              {children}
            </BaseLayout>
          </TestProvider>
        </AuthProvider>
      </body>
    </html>
  );
}