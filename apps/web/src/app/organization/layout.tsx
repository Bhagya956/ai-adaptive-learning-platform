"use client";

import ProtectedRoute from "@/src/components/ProtectedRoute";

export default function OrganizationLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute allowedRoles={["organization"]}>{children}</ProtectedRoute>;
}
