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

<Link href="/learning">
  Learning Tracker
</Link>


<Link
  href="/admin"
  className="border rounded p-4 hover:bg-gray-100"
>
  <h2 className="font-bold">
    Admin Dashboard
  </h2>

  <p>
    Platform analytics
  </p>
</Link>


<Link
  href="/quiz"
  className="border rounded p-4"
>
  <h2 className="font-bold">
    Quiz Generator
  </h2>

  <p>
    Test your knowledge
  </p>
</Link>

<Link
  href="/quiz/history"
  className="border rounded p-4"
>
  <h2 className="font-bold">
    Quiz History
  </h2>

  <p>
    View previous quizzes
  </p>
</Link>

      </div>
    </nav>
  );
}