import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/src/components/ui/Toast";
import AppShell from "@/src/components/AppShell";

export const metadata: Metadata = {
  title: "SkillPath — Learn Smarter. Build Skills. Grow Your Career.",
  description:
    "A personalized learning and career development platform. Learn, assess, close skill gaps, and grow your career with smart tools and guided paths.",
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
