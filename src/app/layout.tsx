import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "orchestra.ai",
  description: "Visual node-based AI workflow automation — build multi-agent flows without code.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
