"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/authStore";

interface Props {
  children: React.ReactNode;
  /** If provided, only users with one of these roles are allowed.
   *  Unauthorised users are redirected to their own dashboard. */
  allowedRoles?: string[];
}

function getRoleDashboard(role: string): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "educator":
      return "/educator/dashboard";
    case "organization":
      return "/organization/dashboard";
    default:
      return "/dashboard";
  }
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      // Wrong role — send them to their own dashboard
      router.replace(getRoleDashboard(user.role));
    }
  }, [user, allowedRoles, router]);

  if (!user) return null;
  if (allowedRoles && !allowedRoles.includes(user.role)) return null;

  return <>{children}</>;
}
