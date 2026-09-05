"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  BarChart2,
  Target,
  Briefcase,
  FileText,
  Mic2,
  Brain,
  User,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Map,
  ClipboardList,
  TrendingUp,
  FolderKanban,
  Code2,
  GitBranch,
  Layers,
  Activity,
  Users,
  PieChart,
  Menu,
  X,
  GraduationCap,
  Zap,
} from "lucide-react";
import { useAuthStore } from "@/src/store/authStore";

interface NavItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  children?: NavItem[];
}

const studentNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={16} /> },
  {
    label: "Learning",
    icon: <BookOpen size={16} />,
    children: [
      { label: "My Learning", href: "/learning", icon: <ClipboardList size={14} /> },
      { label: "Resources", href: "/resource-recommendation", icon: <Layers size={14} /> },
      { label: "Career Roadmap", href: "/roadmap", icon: <Map size={14} /> },
    ],
  },
  {
    label: "Assessment",
    icon: <Brain size={16} />,
    children: [
      { label: "AI Quiz", href: "/quiz", icon: <Zap size={14} /> },
      { label: "Quiz History", href: "/quiz/history", icon: <ClipboardList size={14} /> },
      { label: "Assigned Assessments", href: "/quiz/assigned", icon: <ClipboardList size={14} /> },
      { label: "Mock Interview", href: "/mock-interview", icon: <Mic2 size={14} /> },
    ],
  },
  {
    label: "Skills",
    icon: <Target size={16} />,
    children: [
      { label: "Skill Gap Analysis", href: "/skill-gap", icon: <TrendingUp size={14} /> },
      { label: "Project Ideas", href: "/project-recommendation", icon: <FolderKanban size={14} /> },
    ],
  },
  {
    label: "Career",
    icon: <Briefcase size={16} />,
    children: [
      { label: "Resume Analysis", href: "/resume", icon: <FileText size={14} /> },
      { label: "Interview Prep", href: "/interview-prep", icon: <Mic2 size={14} /> },
      { label: "Job Readiness", href: "/job-readiness", icon: <GraduationCap size={14} /> },
      { label: "Portfolio Analyzer", href: "/portfolio-analyzer", icon: <GitBranch size={14} /> },
    ],
  },
  {
    label: "Analytics",
    icon: <BarChart2 size={16} />,
    children: [
      { label: "Learning Analytics", href: "/learning-analytics", icon: <PieChart size={14} /> },
      { label: "Activity Timeline", href: "/activity", icon: <Activity size={14} /> },
    ],
  },
  { label: "AI Assistant", href: "/ai-assistant", icon: <Sparkles size={16} /> },
  { label: "Profile", href: "/profile", icon: <User size={16} /> },
];

const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: <LayoutDashboard size={16} /> },
  { label: "User Management", href: "/admin/users", icon: <Users size={16} /> },
  { label: "Analytics", href: "/admin/analytics", icon: <BarChart2 size={16} /> },
  { label: "Profile", href: "/profile", icon: <User size={16} /> },
];

const educatorNav: NavItem[] = [
  { label: "Dashboard", href: "/educator/dashboard", icon: <LayoutDashboard size={16} /> },
  {
    label: "Learners",
    icon: <Users size={16} />,
    children: [
      { label: "My Learners", href: "/educator/learners", icon: <Users size={14} /> },
      { label: "Learning Tracker", href: "/educator/learning-tracker", icon: <ClipboardList size={14} /> },
    ],
  },
  {
    label: "Assessments",
    icon: <Brain size={16} />,
    children: [
      { label: "Assessments", href: "/educator/assessments", icon: <ClipboardList size={14} /> },
      { label: "Create Assessment", href: "/educator/assessments/create", icon: <Zap size={14} /> },
    ],
  },
  {
    label: "Analytics",
    icon: <BarChart2 size={16} />,
    children: [
      { label: "Learning Analytics", href: "/educator/analytics", icon: <PieChart size={14} /> },
      { label: "Activity Timeline", href: "/educator/activity", icon: <Activity size={14} /> },
    ],
  },
  { label: "AI Assistant", href: "/ai-assistant", icon: <Sparkles size={16} /> },
  { label: "Profile", href: "/profile", icon: <User size={16} /> },
];

const organizationNav: NavItem[] = [
  { label: "Dashboard", href: "/organization/dashboard", icon: <LayoutDashboard size={16} /> },
  {
    label: "Mentors",
    icon: <Users size={16} />,
    children: [
      { label: "All Mentors", href: "/organization/mentors", icon: <Users size={14} /> },
      { label: "Add Mentor",  href: "/organization/mentors/create", icon: <ClipboardList size={14} /> },
    ],
  },
  {
    label: "Students",
    icon: <Users size={16} />,
    children: [
      { label: "All Students", href: "/organization/students",        icon: <Users size={14} /> },
      { label: "Add Student",  href: "/organization/students/create", icon: <ClipboardList size={14} /> },
      { label: "Assignments",  href: "/organization/assignments",     icon: <ClipboardList size={14} /> },
    ],
  },
  {
    label: "Assessments",
    icon: <Brain size={16} />,
    children: [
      { label: "Assessments", href: "/organization/assessments", icon: <ClipboardList size={14} /> },
    ],
  },
  {
    label: "Analytics",
    icon: <BarChart2 size={16} />,
    children: [
      { label: "Organization Analytics", href: "/organization/analytics", icon: <PieChart size={14} /> },
      { label: "Organization Activity",  href: "/organization/activity",  icon: <Activity size={14} /> },
    ],
  },
  { label: "AI Assistant", href: "/ai-assistant", icon: <Sparkles size={16} /> },
  { label: "Profile",      href: "/profile",       icon: <User size={16} /> },
];

function NavGroup({
  item,
  depth = 0,
  defaultOpen = false,
}: {
  item: NavItem;
  depth?: number;
  defaultOpen?: boolean;
}) {
  const pathname = usePathname();
  const isChildActive = item.children?.some((c) => pathname === c.href);
  const [open, setOpen] = useState(defaultOpen || isChildActive || false);

  useEffect(() => {
    if (isChildActive) setOpen(true);
  }, [isChildActive]);

  if (item.href) {
    const isActive = pathname === item.href;
    return (
      <Link
        href={item.href}
        className={[
          "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors duration-150",
          depth === 0
            ? "font-medium"
            : "font-normal ml-3 text-[13px]",
          isActive
            ? "bg-brand-600 text-white shadow-sm"
            : "text-slate-400 hover:bg-slate-800 hover:text-slate-100",
        ].join(" ")}
      >
        {item.icon && (
          <span className={isActive ? "text-white" : "text-slate-500"}>
            {item.icon}
          </span>
        )}
        {item.label}
      </Link>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={[
          "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150",
          isChildActive
            ? "text-brand-400"
            : "text-slate-400 hover:bg-slate-800 hover:text-slate-100",
        ].join(" ")}
        aria-expanded={open}
      >
        {item.icon && (
          <span className={isChildActive ? "text-brand-400" : "text-slate-500"}>
            {item.icon}
          </span>
        )}
        <span className="flex-1 text-left">{item.label}</span>
        {open ? (
          <ChevronDown size={13} className="text-slate-500" />
        ) : (
          <ChevronRight size={13} className="text-slate-500" />
        )}
      </button>
      {open && item.children && (
        <div className="mt-0.5 mb-1 space-y-0.5">
          {item.children.map((child) => (
            <NavGroup key={child.label} item={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AppSidebar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems =
    user?.role === "admin"
      ? adminNav
      : user?.role === "educator"
      ? educatorNav
      : user?.role === "organization"
      ? organizationNav
      : studentNav;
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center shrink-0">
          <Sparkles size={16} className="text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-white truncate">SkillPath AI</p>
          <p className="text-[10px] text-slate-500 truncate">Learning Platform</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {navItems.map((item) => (
          <NavGroup key={item.label} item={item} />
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-slate-800 px-3 py-3">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg mb-1">
          <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-[11px] font-bold text-white shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-200 truncate">{user?.name}</p>
            <p className="text-[10px] text-slate-500 truncate capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-danger transition-colors duration-150"
        >
          <LogOut size={15} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 text-white rounded-lg shadow-lg"
        aria-label="Open sidebar"
      >
        <Menu size={18} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={[
          "lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
          aria-label="Close sidebar"
        >
          <X size={18} />
        </button>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-60 bg-slate-900 fixed inset-y-0 left-0 z-30">
        {sidebarContent}
      </aside>
    </>
  );
}
