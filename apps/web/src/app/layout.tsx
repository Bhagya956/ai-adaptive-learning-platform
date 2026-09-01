import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/src/components/ui/Toast";
import AppShell from "@/src/components/AppShell";

export const metadata: Metadata = {
  title: "SkillPath AI — Learn Smarter. Build Skills. Grow Your Career.",
  description:
    "An AI-powered platform that connects personalized learning, skill development, assessment, and career growth in one intelligent ecosystem.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <AppShell>{children}</AppShell>
        </ToastProvider>
      </body>
    </html>
  );
}
