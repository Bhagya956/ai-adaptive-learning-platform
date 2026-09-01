"use client";

import { usePathname } from "next/navigation";
import AppSidebar from "./AppSidebar";

const PUBLIC_ROUTES = ["/", "/login", "/register"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic = PUBLIC_ROUTES.includes(pathname);

  if (isPublic) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-surface-2">
      <AppSidebar />
      {/* Main content offset for fixed sidebar */}
      <div className="flex-1 lg:ml-60 flex flex-col min-w-0">
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
