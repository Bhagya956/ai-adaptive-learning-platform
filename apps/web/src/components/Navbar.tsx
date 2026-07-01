"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-gray-900 text-white p-4">
      <div className="flex gap-6">

        <Link href="/dashboard">
          Dashboard
        </Link>

        <Link href="/profile">
          Profile
        </Link>

        <Link href="/roadmap">
          Roadmap
        </Link>

        <Link href="/resume">
          Resume Analyzer
        </Link>

        <Link href="/skill-gap">
          Skill Gap
        </Link>

        <Link href="/interview-prep">
          Interview Prep
        </Link>

        <Link href="/roadmap/history">
  Roadmap History
</Link>

      </div>
    </nav>
  );
}