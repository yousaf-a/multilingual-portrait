import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Multilingual Portrait Studio | 100 Languages Art",
  description: "Transform your photos into glowing portraits written in 100 languages.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#030712] text-white">
        {children}
      </body>
    </html>
  );
}
