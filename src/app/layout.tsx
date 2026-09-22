import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Automation Web Application",
  description:
    "ระบบสนับสนุนงาน Automation และงานบำรุงรักษาเครื่องจักรในโรงงาน",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}