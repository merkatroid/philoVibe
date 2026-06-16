import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster as SonnerToaster } from "sonner";
import { Toaster as HotToaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "PhiloVibe | Philosophy Learning",
  description: "A beautiful space for deep philosophical exploration. Engage with history's greatest thinkers through live conversation, curated texts, and structured learning paths.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100">
        {children}
        
        {/* Production-grade toasts */}
        <SonnerToaster 
          position="top-center" 
          richColors 
          closeButton 
          className="sonner-toast" 
        />
        <HotToaster 
          position="bottom-center"
          toastOptions={{
            style: {
              background: 'rgb(24 24 27)',
              color: 'rgb(244 244 245)',
              border: '1px solid rgb(39 39 42)',
            },
          }}
        />
      </body>
    </html>
  );
}
