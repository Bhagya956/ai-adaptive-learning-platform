"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import AppSidebar from "./AppSidebar";
import { useAuthStore } from "@/src/store/authStore";

const PUBLIC_ROUTES = ["/", "/login", "/register"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();
  const isPublic = PUBLIC_ROUTES.includes(pathname);

  useEffect(() => {
    // Redirect unauthenticated users away from protected routes
    if (!isPublic && !user) {
      router.replace("/login");
    }
  }, [isPublic, user, router]);

  if (isPublic) {
    return <>{children}</>;
  }

  // While redirecting (no user on a protected route), render nothing
  if (!user) {
    return null;
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
