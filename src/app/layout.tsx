import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LifeGPS — Navigate Your Future with AI",
  description:
    "LifeGPS is an AI Life Architect for professionals who want to escape burnout, change careers, build side businesses, and design their dream life.",
  keywords: [
    "life planning",
    "AI coach",
    "career change",
    "burnout",
    "life blueprint",
    "RemoteGeek Hub",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
