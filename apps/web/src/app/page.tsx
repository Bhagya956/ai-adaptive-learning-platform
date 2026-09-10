"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  ArrowRight, BookOpen, Brain, Target, BarChart2,
  FileText, Map, Mic2, Sparkles,
  GraduationCap, Zap, Users, CheckCircle2,
  TrendingUp, Layers,
} from "lucide-react";
// ─── Data ──────────────────────────────────────────────────────────────────────

const features = [
  { icon: BookOpen,  title: "My Learning",         desc: "Create and track learning tasks with deadlines and progress indicators.",  bg: "bg-blue-50",    text: "text-blue-600"    },
  { icon: Brain,     title: "Practice Quiz",        desc: "Generate quizzes on any topic and test yourself with a countdown timer.",  bg: "bg-violet-50",  text: "text-violet-600"  },
  { icon: Target,    title: "Skill Gap Analysis",   desc: "Identify missing skills for your target role and get actionable steps.",   bg: "bg-rose-50",    text: "text-rose-600"    },
  { icon: BarChart2, title: "Learning Analytics",   desc: "Track completion rates, activity patterns, and progress over time.",      bg: "bg-emerald-50", text: "text-emerald-600" },
  { icon: FileText,  title: "Resume Analysis",      desc: "Score your resume, identify gaps, and receive improvement suggestions.",  bg: "bg-amber-50",   text: "text-amber-600"   },
  { icon: Map,       title: "Career Roadmap",       desc: "Generate a personalised step-by-step career development plan.",          bg: "bg-indigo-50",  text: "text-indigo-600"  },
  { icon: Mic2,      title: "Mock Interview",       desc: "Practice with role-specific questions across beginner to experienced.",   bg: "bg-pink-50",    text: "text-pink-600"    },
  { icon: Layers,    title: "Learning Resources",   desc: "Curated documentation, videos, courses, and project ideas per topic.",   bg: "bg-cyan-50",    text: "text-cyan-600"    },
];

const steps = [
  { n: "01", title: "Set Your Goal",           desc: "Define what you want to learn or where you want your career to go." },
  { n: "02", title: "Learn & Practice",        desc: "Use resources, tasks, quizzes, and assessments to build skills." },
  { n: "03", title: "Track Your Progress",     desc: "Monitor your learning completion, activity, and analytics." },
  { n: "04", title: "Prepare for What's Next", desc: "Build career readiness through roadmaps, interviews, and skill analysis." },
];

const highlights = [
  { icon: GraduationCap, label: "Personalised Paths",   desc: "Tailored to every learner's goals" },
  { icon: Users,          label: "All Roles Supported",  desc: "Students, Educators, Organizations" },
  { icon: TrendingUp,     label: "Real-Time Analytics",  desc: "Track progress as you grow" },
  { icon: CheckCircle2,   label: "Mentor Guidance",      desc: "Connect with educators directly"  },
];

const roles = [
  {
    icon: GraduationCap,
    role: "Students",
    grad: "from-brand-600 to-blue-500",
    bg: "bg-brand-50", text: "text-brand-600", border: "border-brand-100",
    points: ["Personalised learning paths", "Skill gap analysis", "Career roadmap", "Practice quizzes"],
  },
  {
    icon: Users,
    role: "Educators & Mentors",
    grad: "from-emerald-600 to-teal-500",
    bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100",
    points: ["Manage assigned learners", "Track learning progress", "Create assessments", "View learner analytics"],
  },
  {
    icon: BarChart2,
    role: "Organizations",
    grad: "from-violet-600 to-purple-500",
    bg: "bg-violet-50", text: "text-violet-600", border: "border-violet-100",
    points: ["Manage mentors & students", "Organisation analytics", "Mentor-student assignments", "Monitor team progress"],
  },
];

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [scrolled, setScrolled]     = useState(false);
  const [mobileMenuOpen, setMobileMenu] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans overflow-x-hidden" style={{ background: "#f8f7ff" }}>

      {/* ── Keyframe styles injected via a style tag ── */}
      <style>{`
        @keyframes bounceSlow {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }
        .animate-bounce-slow { animation: bounceSlow 3s ease-in-out infinite; }
        @keyframes floatLeft {
          0%, 100% { transform: translateX(0px) translateY(0px); }
          33%       { transform: translateX(-6px) translateY(-4px); }
          66%       { transform: translateX(4px) translateY(-8px); }
        }
        @keyframes floatRight {
          0%, 100% { transform: translateX(0px) translateY(0px); }
          33%       { transform: translateX(6px) translateY(-6px); }
          66%       { transform: translateX(-4px) translateY(-10px); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .animate-fade-up        { animation: fadeUp 0.7s ease-out both; }
        .animate-fade-up-d1     { animation: fadeUp 0.7s 0.15s ease-out both; }
        .animate-fade-up-d2     { animation: fadeUp 0.7s 0.3s  ease-out both; }
        .animate-fade-up-d3     { animation: fadeUp 0.7s 0.45s ease-out both; }
        @keyframes gradientShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .hero-bg-animate {
          background-size: 300% 300%;
          animation: gradientShift 12s ease infinite;
        }
        @keyframes heroFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-12px); }
        }
        .animate-hero-float {
          animation: heroFloat 6s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-bounce-slow, .animate-fade-up, .animate-fade-up-d1,
          .animate-fade-up-d2, .animate-fade-up-d3, .hero-bg-animate,
          .animate-hero-float { animation: none !important; }
        }
      `}</style>

      {/* ── Navbar ── */}
      <header className={[
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100/80"
          : "bg-white/60 backdrop-blur-sm",
      ].join(" ")}>
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-600 to-blue-500 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Sparkles size={14} className="text-white" />
            </div>
            <span className="text-sm font-bold text-slate-800">SkillPath AI</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7 text-sm text-slate-500 font-medium">
            <a href="#" className="hover:text-brand-600 transition-colors">Home</a>
            <a href="#features" className="hover:text-brand-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-brand-600 transition-colors">About</a>
            <a href="#roles" className="hover:text-brand-600 transition-colors">Contact</a>
          </nav>

          {/* CTA buttons */}
          <div className="hidden md:flex items-center gap-2">
            <Link href="/login"
              className="text-sm font-medium text-slate-600 hover:text-brand-600 px-3.5 py-1.5 rounded-lg hover:bg-brand-50 transition-all">
              Sign In
            </Link>
            <Link href="/register"
              className="inline-flex items-center gap-1.5 text-sm font-semibold bg-gradient-to-r from-brand-600 to-blue-500 text-white px-5 py-2 rounded-xl hover:from-brand-700 hover:to-blue-600 transition-all shadow-md shadow-brand-200/50">
              Get Started
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-brand-50 text-slate-600"
            onClick={() => setMobileMenu((v) => !v)}
            aria-label="Toggle menu"
          >
            <div className="w-5 flex flex-col gap-1">
              <span className={`h-0.5 bg-slate-600 rounded transition-all ${mobileMenuOpen ? "rotate-45 translate-y-1.5" : ""}`} />
              <span className={`h-0.5 bg-slate-600 rounded transition-all ${mobileMenuOpen ? "opacity-0" : ""}`} />
              <span className={`h-0.5 bg-slate-600 rounded transition-all ${mobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
            </div>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 px-5 py-4 space-y-3">
            {[["#", "Home"], ["#features","Features"], ["#how-it-works","About"], ["#roles","Contact"]].map(([href, label]) => (
              <a key={label} href={href} onClick={() => setMobileMenu(false)}
                className="block text-sm font-medium text-slate-600 hover:text-brand-600 py-1.5">{label}</a>
            ))}
            <div className="flex gap-3 pt-2 border-t border-slate-100">
              <Link href="/login" className="flex-1 text-center text-sm font-medium border border-border rounded-xl py-2 text-slate-600 hover:bg-slate-50">Sign In</Link>
              <Link href="/register" className="flex-1 text-center text-sm font-semibold bg-gradient-to-r from-brand-600 to-blue-500 text-white rounded-xl py-2">Get Started</Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">

        {/* ── Hero ── */}
        <section className="relative overflow-hidden">
          {/* Soft gradient background matching the reference — light lavender/pink/cyan */}
          <div
            className="absolute inset-0 hero-bg-animate pointer-events-none"
            style={{
              background: "linear-gradient(135deg, #f0f0ff 0%, #fdf4ff 25%, #eff6ff 50%, #f0fdff 75%, #fdf2f8 100%)",
            }}
          />
          {/* Large blurred orbs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-80px] right-[-80px] w-[480px] h-[480px] rounded-full bg-violet-300/25 blur-3xl" style={{ animation: "floatRight 8s ease-in-out infinite" }} />
            <div className="absolute bottom-[-60px] left-[-60px]  w-[400px] h-[400px] rounded-full bg-cyan-300/20    blur-3xl" style={{ animation: "floatLeft  7s ease-in-out infinite" }} />
            <div className="absolute top-1/3 left-1/3              w-[300px] h-[300px] rounded-full bg-pink-200/15    blur-3xl" />
          </div>

          <div className="relative max-w-6xl mx-auto px-5 py-20 md:py-28">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

              {/* ── Left column ── */}
              <div className="animate-fade-up">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight text-slate-900 mb-5">
                  Learn Today,{" "}
                  <br />
                  <span
                    className="bg-clip-text text-transparent"
                    style={{ backgroundImage: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #3b82f6 100%)" }}
                  >
                    Build Tomorrow
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-slate-500 leading-relaxed mb-7 max-w-md">
                  Your personalized learning and career development platform for a brighter future.
                </p>

                {/* Feature micro-pills */}
                <div className="flex flex-wrap gap-3 mb-8">
                  {[
                    { icon: BookOpen,     label: "Learn",       color: "text-brand-600",   bg: "bg-brand-50"   },
                    { icon: Zap,          label: "Practice",    color: "text-violet-600",  bg: "bg-violet-50"  },
                    { icon: TrendingUp,   label: "Build Skills",color: "text-emerald-600", bg: "bg-emerald-50" },
                    { icon: GraduationCap,label: "Grow Career", color: "text-blue-600",    bg: "bg-blue-50"    },
                  ].map(({ icon: Icon, label, color, bg }) => (
                    <span key={label} className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${bg} ${color} border border-current/10`}>
                      <Icon size={12} />
                      {label}
                    </span>
                  ))}
                </div>

                {/* CTA buttons */}
                <div className="flex flex-wrap gap-3 mb-10 animate-fade-up-d1">
                  <Link href="/register"
                    className="inline-flex items-center gap-2 text-sm font-bold bg-gradient-to-r from-brand-600 to-blue-500 text-white px-6 py-3 rounded-xl shadow-lg shadow-brand-300/40 hover:from-brand-700 hover:to-blue-600 hover:shadow-xl hover:shadow-brand-300/50 hover:-translate-y-0.5 transition-all duration-200">
                    Get Started Free <ArrowRight size={14} />
                  </Link>
                  <a href="#how-it-works"
                    className="inline-flex items-center gap-2 text-sm font-semibold border-2 border-slate-200 text-slate-700 px-6 py-3 rounded-xl hover:border-brand-300 hover:text-brand-700 hover:bg-brand-50/50 transition-all duration-200">
                    Learn More
                  </a>
                </div>
              </div>

              {/* ── Right column — illustration ── */}
              <div className="animate-fade-up-d2 hidden sm:flex items-center justify-center">
                <div className="animate-hero-float relative w-full max-w-[480px]">
                  {/* Soft glow behind illustration — blends with the pastel hero */}
                  <div
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                      background: "radial-gradient(ellipse at center, rgba(167,139,250,0.18) 0%, rgba(147,197,253,0.12) 50%, transparent 75%)",
                      transform: "scale(1.15)",
                    }}
                  />
                  <Image
                    src="/hero-illustration.svg"
                    alt="Student sitting on books with a laptop, surrounded by learning icons and a graduation cap"
                    width={480}
                    height={480}
                    priority
                    className="relative w-full h-auto object-contain drop-shadow-xl"
                    style={{ maxHeight: "480px" }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Soft wave divider */}
          <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none pointer-events-none" style={{ height: "60px" }}>
            <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" preserveAspectRatio="none">
              <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="white" fillOpacity="0.9" />
            </svg>
          </div>
        </section>

        {/* ── Trust / Highlights section ── */}
        <section className="bg-white py-14">
          <div className="max-w-4xl mx-auto px-5">
            <p className="text-center text-xs font-semibold text-text-muted uppercase tracking-widest mb-8">
              Trusted by learners and organizations
            </p>
            <div className="bg-white rounded-3xl shadow-lg border border-slate-100 px-8 py-7">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {highlights.map((h) => (
                  <div key={h.label} className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-50 to-blue-50 border border-brand-100/60 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <h.icon size={18} className="text-brand-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 leading-tight">{h.label}</p>
                      <p className="text-[11px] text-text-muted leading-tight mt-0.5">{h.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section id="features" className="py-20 bg-gradient-to-b from-white to-slate-50/80">
          <div className="max-w-6xl mx-auto px-5">
            <div className="text-center mb-12 animate-fade-up">
              <span className="inline-block text-xs font-semibold text-brand-600 bg-brand-50 border border-brand-100 px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
                Everything you need
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                One platform, infinite possibilities
              </h2>
              <p className="text-text-secondary text-base max-w-xl mx-auto">
                From personalised learning to career readiness — all your tools in one place.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {features.map((f, i) => (
                <div key={f.title}
                  className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg hover:border-brand-100 hover:-translate-y-1 transition-all duration-200 group"
                  style={{ animationDelay: `${i * 60}ms` }}>
                  <div className={`w-10 h-10 rounded-xl ${f.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                    <f.icon size={18} className={f.text} />
                  </div>
                  <h3 className="font-semibold text-text-primary text-sm mb-1.5">{f.title}</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section id="how-it-works" className="py-20 bg-white">
          <div className="max-w-5xl mx-auto px-5">
            <div className="text-center mb-12">
              <span className="inline-block text-xs font-semibold text-violet-600 bg-violet-50 border border-violet-100 px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
                Simple steps
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">How it works</h2>
              <p className="text-text-secondary text-base">Four steps to learning success.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
              {/* Connector line */}
              <div className="hidden md:block absolute top-6 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-brand-200 via-violet-200 to-blue-200" />
              {steps.map((s, i) => (
                <div key={s.n} className="flex flex-col items-center text-center group">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-600 to-blue-500 text-white font-bold text-sm flex items-center justify-center mb-4 shadow-lg shadow-brand-200/50 group-hover:scale-110 group-hover:shadow-xl transition-all duration-200 relative z-10">
                    {s.n}
                  </div>
                  <h3 className="font-semibold text-text-primary text-sm mb-1.5">{s.title}</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Who it's for ── */}
        <section id="roles" className="py-20 bg-gradient-to-b from-slate-50/80 to-white">
          <div className="max-w-6xl mx-auto px-5">
            <div className="text-center mb-12">
              <span className="inline-block text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
                Built for everyone
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">Your role, your experience</h2>
              <p className="text-text-secondary text-base max-w-xl mx-auto">SkillPath AI supports students, educators, and organisations in one unified platform.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {roles.map((r) => (
                <div key={r.role}
                  className={`rounded-2xl border ${r.border} bg-white p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-200`}>
                  <div className={`w-11 h-11 rounded-xl ${r.bg} flex items-center justify-center mb-4`}>
                    <r.icon size={20} className={r.text} />
                  </div>
                  <h3 className="font-bold text-text-primary mb-3 text-base">{r.role}</h3>
                  <ul className="space-y-2 mb-5">
                    {r.points.map((p) => (
                      <li key={p} className="flex items-center gap-2 text-sm text-text-secondary">
                        <CheckCircle2 size={13} className={r.text} />
                        {p}
                      </li>
                    ))}
                  </ul>
                  <Link href="/register"
                    className={`inline-flex items-center gap-1.5 text-xs font-bold bg-gradient-to-r ${r.grad} text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity`}>
                    Get started <ArrowRight size={11} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="py-24 relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none hero-bg-animate"
            style={{ background: "linear-gradient(135deg, #ede9fe 0%, #fdf4ff 35%, #eff6ff 65%, #ecfeff 100%)" }}
          />
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-20 right-10  w-80 h-80 rounded-full bg-violet-300/20 blur-3xl" />
            <div className="absolute -bottom-20 left-10 w-80 h-80 rounded-full bg-cyan-300/20   blur-3xl" />
          </div>
          <div className="relative max-w-2xl mx-auto px-5 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-600 to-blue-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-brand-200">
              <GraduationCap size={26} className="text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Your next step starts here.
            </h2>
            <p className="text-text-secondary text-base mb-8 leading-relaxed max-w-md mx-auto">
              Learn the skills you need, build confidence, and move toward your career goals.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/register"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-600 to-blue-500 text-white font-bold px-8 py-3.5 rounded-xl hover:from-brand-700 hover:to-blue-600 hover:-translate-y-0.5 transition-all shadow-lg shadow-brand-300/40">
                Get Started Free <ArrowRight size={15} />
              </Link>
              <Link href="/login"
                className="inline-flex items-center gap-2 border-2 border-brand-200 text-brand-700 font-semibold px-8 py-3.5 rounded-xl hover:bg-brand-50 hover:border-brand-300 transition-all">
                Sign In
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-slate-100 py-8">
        <div className="max-w-6xl mx-auto px-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-600 to-blue-500 flex items-center justify-center">
              <Sparkles size={13} className="text-white" />
            </div>
            <span className="text-sm font-bold text-slate-800">SkillPath AI</span>
          </div>
          <p className="text-xs text-text-muted text-center">
            © {new Date().getFullYear()} SkillPath AI — Adaptive Learning & Career Development Platform
          </p>
          <div className="flex gap-5 text-xs text-text-muted">
            <Link href="/login"    className="hover:text-brand-600 transition-colors">Sign In</Link>
            <Link href="/register" className="hover:text-brand-600 transition-colors">Get Started</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
