import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "COLLABO — Real-time Collaborative Whiteboard",
  description:
    "Think together. Build ideas together. A playful real-time collaborative whiteboard designed for students, hackathons, and study groups.",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-indigo-50/60 via-white to-amber-50/40 text-slate-800 antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
