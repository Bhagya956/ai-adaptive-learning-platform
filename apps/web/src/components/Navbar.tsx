"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [role, setRole] =
    useState("");

  useEffect(() => {
    const authStorage =
      JSON.parse(
        localStorage.getItem(
          "auth-storage"
        ) || "{}"
      );

    setRole(
      authStorage?.state?.user
        ?.role || ""
    );
  }, []);

  const studentLinks = [
    {
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      label: "Profile",
      href: "/profile",
    },
    {
      label: "Roadmap",
      href: "/roadmap",
    },
    {
      label: "Roadmap History",
      href: "/roadmap/history",
    },
    {
      label: "Resume Analyzer",
      href: "/resume",
    },
    {
      label: "Skill Gap",
      href: "/skill-gap",
    },
    {
      label: "Interview Prep",
      href: "/interview-prep",
    },
    {
      label: "Learning Tracker",
      href: "/learning",
    },
    {
      label: "Quiz",
      href: "/quiz",
    },
    {
      label: "Quiz History",
      href: "/quiz/history",
    },
    {
      label: "Job Readiness",
      href: "/job-readiness",
    },
  ];

  const adminLinks = [
    {
      label: "Admin Dashboard",
      href: "/admin",
    },
    {
      label: "User Management",
      href: "/admin/users",
    },
    {
      label: "Admin Analytics",
      href: "/admin/analytics",
    },
  ];

  return (
    <nav className="bg-gray-900 text-white p-4">

      <div className="flex flex-wrap gap-4">

        {studentLinks.map(
          (link) => (
            <Link
              key={link.href}
              href={link.href}
            >
              {link.label}
            </Link>
          )
        )}

        {role === "admin" &&
          adminLinks.map(
            (link) => (
              <Link
                key={link.href}
                href={link.href}
              >
                {link.label}
              </Link>
            )
          )}

          <Link href="/project-recommendation">
  Project Recommendations
</Link>

      </div>

    </nav>
  );
}