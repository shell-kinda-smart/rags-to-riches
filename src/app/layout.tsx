import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: { default: "Rags to Riches", template: "%s | Rags to Riches" },
  description: "Full-stack student finance and savings platform",
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
