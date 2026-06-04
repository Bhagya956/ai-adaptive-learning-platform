"use client";

import { useRouter } from "next/navigation";

import { useAuthStore } from "@/src/store/authStore"; 
import ProtectedRoute from "@/src/components/ProtectedRoute";
import Link from "next/link";

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
  onClick={() => router.push("/resume")}
  className="bg-green-500 text-white px-4 py-2 rounded"
>
  Resume Analyzer
</button>

<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">

  <Link
    href="/roadmap"
    className="border rounded p-6 hover:bg-gray-100"
  >
    <h2 className="font-bold">
      AI Roadmap
    </h2>
  </Link>



  <Link
    href="/skill-gap"
    className="border rounded p-6 hover:bg-gray-100"
  >
    <h2 className="font-bold">
      Skill Gap Analyzer
    </h2>
  </Link>

  <Link
    href="/interview-prep"
    className="border rounded p-6 hover:bg-gray-100"
  >
    <h2 className="font-bold">
      Interview Preparation
    </h2>
  </Link>

  <Link
    href="/profile"
    className="border rounded p-6 hover:bg-gray-100"
  >
    <h2 className="font-bold">
      Profile
    </h2>
  </Link>

</div>

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