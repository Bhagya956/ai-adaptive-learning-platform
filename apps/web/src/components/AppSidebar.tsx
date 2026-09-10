"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, BookOpen, BarChart2, Target, Briefcase,
  FileText, Mic2, Brain, User, LogOut, ChevronDown, ChevronRight,
  Sparkles, Map, ClipboardList, TrendingUp, FolderKanban, GitBranch,
  Layers, Activity, Users, PieChart, Menu, X, GraduationCap, Zap,
} from "lucide-react";
import { useAuthStore } from "@/src/store/authStore";

interface NavItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  children?: NavItem[];
}

// ─── Nav arrays ───────────────────────────────────────────────────────────────

const studentNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={15} /> },
  {
    label: "Analytics",
    icon: <BarChart2 size={15} />,
    children: [
      { label: "Learning Analytics", href: "/learning-analytics", icon: <PieChart size={13} /> },
      { label: "Activity Timeline",  href: "/activity",           icon: <Activity size={13} /> },
    ],
  },
  {
    label: "My Learning",
    icon: <BookOpen size={15} />,
    children: [
      { label: "Tasks",          href: "/learning",                icon: <ClipboardList size={13} /> },
      { label: "Resources",      href: "/resource-recommendation", icon: <Layers size={13} /> },
      { label: "Career Roadmap", href: "/roadmap",                 icon: <Map size={13} /> },
    ],
  },
  {
    label: "Assessment",
    icon: <Brain size={15} />,
    children: [
      { label: "Practice Quiz",  href: "/quiz",           icon: <Zap size={13} /> },
      { label: "Quiz History",   href: "/quiz/history",   icon: <ClipboardList size={13} /> },
      { label: "Mock Interview", href: "/mock-interview", icon: <Mic2 size={13} /> },
    ],
  },
  {
    label: "Skills",
    icon: <Target size={15} />,
    children: [
      { label: "Skill Gap Analysis", href: "/skill-gap",              icon: <TrendingUp size={13} /> },
      { label: "Project Ideas",      href: "/project-recommendation", icon: <FolderKanban size={13} /> },
    ],
  },
  {
    label: "Career",
    icon: <Briefcase size={15} />,
    children: [
      { label: "Resume Analysis", href: "/resume",             icon: <FileText size={13} /> },
      { label: "Portfolio",       href: "/portfolio-analyzer", icon: <GitBranch size={13} /> },
    ],
  },
  { label: "AI Assistant", href: "/ai-assistant", icon: <Sparkles size={15} /> },
  { label: "Profile",      href: "/profile",       icon: <User size={15} /> },
];

const adminNav: NavItem[] = [
  { label: "Dashboard",       href: "/admin",          icon: <LayoutDashboard size={15} /> },
  { label: "User Management", href: "/admin/users",    icon: <Users size={15} /> },
  { label: "Analytics",       href: "/admin/analytics",icon: <BarChart2 size={15} /> },
  { label: "Profile",         href: "/profile",        icon: <User size={15} /> },
];

const educatorNav: NavItem[] = [
  { label: "Dashboard", href: "/educator/dashboard", icon: <LayoutDashboard size={15} /> },
  {
    label: "Learners",
    icon: <Users size={15} />,
    children: [
      { label: "My Learners",        href: "/educator/learners",           icon: <Users size={13} /> },
      { label: "Requested Students", href: "/educator/requested-students", icon: <ClipboardList size={13} /> },
      { label: "Learning Tracker",   href: "/educator/learning-tracker",   icon: <ClipboardList size={13} /> },
    ],
  },
  {
    label: "Assessments",
    icon: <Brain size={15} />,
    children: [
      { label: "Assessments",       href: "/educator/assessments",        icon: <ClipboardList size={13} /> },
      { label: "Create Assessment", href: "/educator/assessments/create", icon: <Zap size={13} /> },
    ],
  },
  {
    label: "Analytics",
    icon: <BarChart2 size={15} />,
    children: [
      { label: "Learning Analytics", href: "/educator/analytics", icon: <PieChart size={13} /> },
      { label: "Activity Timeline",  href: "/educator/activity",  icon: <Activity size={13} /> },
    ],
  },
  { label: "AI Assistant", href: "/ai-assistant", icon: <Sparkles size={15} /> },
  { label: "Profile",      href: "/profile",       icon: <User size={15} /> },
];

const organizationNav: NavItem[] = [
  { label: "Dashboard", href: "/organization/dashboard", icon: <LayoutDashboard size={15} /> },
  {
    label: "Mentors",
    icon: <Users size={15} />,
    children: [
      { label: "All Mentors",       href: "/organization/mentors",          icon: <Users size={13} /> },
      { label: "Add Mentor",        href: "/organization/mentors/create",   icon: <ClipboardList size={13} /> },
      { label: "Requested Mentors", href: "/organization/requests/mentors", icon: <ClipboardList size={13} /> },
    ],
  },
  {
    label: "Students",
    icon: <Users size={15} />,
    children: [
      { label: "All Students",       href: "/organization/students",           icon: <Users size={13} /> },
      { label: "Add Student",        href: "/organization/students/create",    icon: <ClipboardList size={13} /> },
      { label: "Assignments",        href: "/organization/assignments",        icon: <ClipboardList size={13} /> },
      { label: "Requested Students", href: "/organization/requests/students",  icon: <ClipboardList size={13} /> },
    ],
  },
  {
    label: "Assessments",
    icon: <Brain size={15} />,
    children: [
      { label: "Assessments", href: "/organization/assessments", icon: <ClipboardList size={13} /> },
    ],
  },
  {
    label: "Analytics",
    icon: <BarChart2 size={15} />,
    children: [
      { label: "Organization Analytics", href: "/organization/analytics", icon: <PieChart size={13} /> },
      { label: "Organization Activity",  href: "/organization/activity",  icon: <Activity size={13} /> },
    ],
  },
  { label: "AI Assistant", href: "/ai-assistant", icon: <Sparkles size={15} /> },
  { label: "Profile",      href: "/profile",       icon: <User size={15} /> },
];

// ─── NavGroup ─────────────────────────────────────────────────────────────────

function NavGroup({ item, depth = 0 }: { item: NavItem; depth?: number }) {
  const pathname       = usePathname();
  const isChildActive  = item.children?.some((c) => pathname === c.href || pathname.startsWith((c.href ?? "") + "/"));
  const [open, setOpen] = useState(isChildActive || false);

  useEffect(() => { if (isChildActive) setOpen(true); }, [isChildActive]);

  if (item.href) {
    const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href + "/"));
    return (
      <Link
        href={item.href}
        className={[
          "flex items-center gap-2.5 rounded-xl text-[13px] transition-all duration-200",
          depth === 0 ? "px-3 py-2 font-medium" : "px-3 py-1.5 ml-2 font-normal",
          isActive
            ? "bg-gradient-to-r from-brand-600 to-blue-500 text-white shadow-sm shadow-brand-200"
            : depth === 0
              ? "text-slate-600 hover:bg-white/70 hover:text-brand-700"
              : "text-slate-500 hover:bg-white/60 hover:text-brand-600",
        ].join(" ")}
      >
        {item.icon && (
          <span className={isActive ? "text-white/90" : "opacity-70"}>
            {item.icon}
          </span>
        )}
        <span className="flex-1 truncate">{item.label}</span>
      </Link>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={[
          "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-150",
          isChildActive
            ? "text-brand-700 bg-brand-50/60"
            : "text-slate-600 hover:bg-white/70 hover:text-brand-700",
        ].join(" ")}
        aria-expanded={open}
      >
        {item.icon && (
          <span className={isChildActive ? "text-brand-600 opacity-90" : "opacity-60"}>
            {item.icon}
          </span>
        )}
        <span className="flex-1 text-left">{item.label}</span>
        {open
          ? <ChevronDown size={12} className="text-current opacity-50" />
          : <ChevronRight size={12} className="text-current opacity-40" />}
      </button>

      {open && item.children && (
        <div className="mt-0.5 mb-0.5 space-y-0.5 pl-1">
          {item.children.map((child) => (
            <NavGroup key={child.label} item={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── AppSidebar ───────────────────────────────────────────────────────────────

export default function AppSidebar() {
  const { user, logout } = useAuthStore();
  const router           = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Build nav list — inject "Assigned Assessments" for mentor/org students
  const navItems = (() => {
    if (user?.role === "admin")        return adminNav;
    if (user?.role === "educator")     return educatorNav;
    if (user?.role === "organization") return organizationNav;

    if (user?.educatorId || user?.organizationId) {
      return studentNav.map((item) => {
        if (item.label === "Assessment" && item.children) {
          const already = item.children.some((c) => c.href === "/quiz/assigned");
          if (!already) {
            return {
              ...item,
              children: [
                ...item.children,
                { label: "Assigned Assessments", href: "/quiz/assigned", icon: <ClipboardList size={13} /> },
              ],
            };
          }
        }
        return item;
      });
    }
    return studentNav;
  })();

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const roleLabel: Record<string, string> = {
    student: "Student", educator: "Educator", organization: "Organization", admin: "Admin",
  };

  const handleLogout = () => { logout(); router.push("/login"); };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* ── Logo ── */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-white/50">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-600 to-blue-500 flex items-center justify-center shadow-sm shrink-0">
          <Sparkles size={15} className="text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-800 truncate leading-tight">SkillPath AI</p>
          <p className="text-[10px] text-slate-400 truncate">Learning Platform</p>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-0.5">
        {navItems.map((item) => (
          <NavGroup key={item.label} item={item} />
        ))}
      </nav>

      {/* ── User footer ── */}
      <div className="border-t border-white/50 px-2.5 py-3 space-y-1">
        {/* User info */}
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/40">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-blue-400 flex items-center justify-center text-[11px] font-bold text-white shrink-0 shadow-sm">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-700 truncate">{user?.name}</p>
            <p className="text-[10px] text-slate-400 capitalize truncate">
              {roleLabel[user?.role ?? ""] ?? user?.role}
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150"
        >
          <LogOut size={14} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Mobile toggle ── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-md border border-border text-slate-600 hover:text-brand-600"
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile sidebar ── */}
      <aside
        className={[
          "lg:hidden fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-300 gradient-sidebar border-r border-white/60 shadow-xl",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-white/60 rounded-lg p-1"
          aria-label="Close menu"
        >
          <X size={16} />
        </button>
        {sidebarContent}
      </aside>

      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex lg:flex-col w-60 gradient-sidebar fixed inset-y-0 left-0 z-30 border-r border-white/60 shadow-sm">
        {sidebarContent}
      </aside>
    </>
  );
}
