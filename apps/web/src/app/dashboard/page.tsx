"use client";

import { useRouter } from "next/navigation";

import { useAuthStore } from "@/src/store/authStore"; 
import ProtectedRoute from "@/src/components/ProtectedRoute";

export default function DashboardPage() {
  const router = useRouter();

  const { user, logout } =
    useAuthStore();

  const handleLogout = () => {
    logout();

    router.push("/login");
  };

  return (
     <ProtectedRoute>
    <div className="p-10">
      <h1 className="text-3xl font-bold">
        Dashboard
      </h1>

      <p className="mt-4">
        Welcome {user?.name}
      </p>

      <p>{user?.email}</p>

      <button
        onClick={handleLogout}
        className="mt-6 bg-red-500 text-white px-4 py-2 rounded"
      >
        Logout
      </button>
    </div>
    </ProtectedRoute>
  );
}