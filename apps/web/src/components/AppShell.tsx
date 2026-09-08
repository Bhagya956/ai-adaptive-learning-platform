"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import AppSidebar from "./AppSidebar";
import { useAuthStore } from "@/src/store/authStore";

const PUBLIC_ROUTES = ["/", "/login", "/register"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const { user } = useAuthStore();
  const isPublic = PUBLIC_ROUTES.includes(pathname);

  useEffect(() => {
    if (!isPublic && !user) router.replace("/login");
  }, [isPublic, user, router]);

  if (isPublic) return <>{children}</>;
  if (!user)    return null;

  return (
    <div className="flex min-h-screen" style={{ background: "var(--color-surface-2)" }}>
      <AppSidebar />
      {/* Offset for fixed sidebar */}
      <div className="flex-1 lg:ml-60 flex flex-col min-w-0">
        <main className="flex-1 p-5 lg:p-7 max-w-7xl w-full">{children}</main>
      </div>
    </div>
  );
}
