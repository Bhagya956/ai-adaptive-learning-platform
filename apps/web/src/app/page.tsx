"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="p-10">

      <h1 className="text-4xl font-bold mb-6">
        AI Learning Platform
      </h1>

      <div className="flex flex-col gap-4">

        <Link href="/login">
          Login
        </Link>

        <Link href="/register">
          Register
        </Link>

        <Link href="/dashboard">
          Dashboard
        </Link>

      </div>

    </div>
  );
}