import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Office Village",
  description: "Incremental office builder cozy en mode tableau blanc.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
