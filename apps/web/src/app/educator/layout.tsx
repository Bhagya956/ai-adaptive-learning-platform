"use client";

import ProtectedRoute from "@/src/components/ProtectedRoute";

export default function EducatorLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute allowedRoles={["educator"]}>{children}</ProtectedRoute>;
}
