import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "pg client",
  description: "Minimal PostgreSQL web client",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-zinc-950 text-zinc-100 antialiased overflow-hidden">
        {children}
      </body>
    </html>
  );
}
