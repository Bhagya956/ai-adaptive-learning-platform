"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Target,
  BarChart2,
  FileText,
  Map,
  Mic2,
  Sparkles,
  CheckCircle,
  ChevronRight,
  GraduationCap,
  Zap,
  Users,
  Star,
} from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Personalized Learning",
    description:
      "AI curates a learning path tailored to your skills, goals, and pace.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Brain,
    title: "AI Assessment",
    description:
      "Generate quizzes on any topic and get instant performance insights.",
    color: "bg-violet-50 text-violet-600",
  },
  {
    icon: Target,
    title: "Skill Gap Analysis",
    description:
      "Identify exactly what skills you're missing for your target role.",
    color: "bg-rose-50 text-rose-600",
  },
  {
    icon: BarChart2,
    title: "Learning Analytics",
    description:
      "Track progress, completion rates, and learning patterns over time.",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: FileText,
    title: "Resume Analysis",
    description:
      "AI scores your resume, highlights gaps, and suggests improvements.",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: Map,
    title: "Career Roadmap",
    description:
      "Get a step-by-step AI-generated path from where you are to where you want to be.",
    color: "bg-cyan-50 text-cyan-600",
  },
  {
    icon: Mic2,
    title: "Interview Preparation",
    description:
      "Practice with AI-generated interview questions for any role.",
    color: "bg-pink-50 text-pink-600",
  },
  {
    icon: Sparkles,
    title: "AI Assistant",
    description:
      "Your always-on career and learning companion powered by Gemini AI.",
    color: "bg-indigo-50 text-indigo-600",
  },
];

const steps = [
  { step: "01", title: "Create your profile", desc: "Tell us your skills, experience, and career goals." },
  { step: "02", title: "Analyze your gaps", desc: "AI identifies exactly what's standing between you and your goal." },
  { step: "03", title: "Follow your roadmap", desc: "Work through a personalized learning and project plan." },
  { step: "04", title: "Assess & improve", desc: "Take quizzes, practice interviews, and track progress." },
  { step: "05", title: "Land your role", desc: "Polish your resume, ace interviews, and measure career readiness." },
];

const stats = [
  { value: "15+", label: "AI-Powered Features" },
  { value: "100%", label: "Personalized" },
  { value: "∞", label: "Learning Paths" },
  { value: "24/7", label: "AI Availability" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-text-primary">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="text-base">SkillPath AI</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm text-text-secondary">
            <a href="#features" className="hover:text-text-primary transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-text-primary transition-colors">How It Works</a>
            <a href="#about" className="hover:text-text-primary transition-colors">About</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors px-3 py-1.5"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 text-sm font-medium bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors shadow-sm"
            >
              Get Started <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-slate-900 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-700/30 via-transparent to-transparent pointer-events-none" />
          <div className="max-w-6xl mx-auto px-6 py-24 md:py-32 relative">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-brand-800/50 border border-brand-700 text-brand-300 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
                <Sparkles size={12} />
                Powered by Google Gemini AI
              </div>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight mb-6">
                Learn Smarter.{" "}
                <span className="text-brand-400">Build Skills.</span>{" "}
                Grow Your Career.
              </h1>
              <p className="text-lg md:text-xl text-slate-300 leading-relaxed mb-8 max-w-2xl">
                An AI-powered platform that connects personalized learning, skill
                development, assessment, and career growth in one intelligent
                ecosystem.
              </p>
              <p className="text-sm text-brand-400 mb-8 italic">
                "Your journey is unique. Your learning should be too."
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-lg shadow-brand-900/50"
                >
                  Get Started Free <ArrowRight size={16} />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats ── */}
        <section className="border-b border-border bg-surface">
          <div className="max-w-6xl mx-auto px-6 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-3xl md:text-4xl font-bold text-brand-600">{s.value}</p>
                  <p className="text-sm text-text-secondary mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section id="features" className="py-20 bg-surface-2">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                Everything you need to grow
              </h2>
              <p className="text-text-secondary text-lg max-w-2xl mx-auto">
                From learning to career readiness — all your tools in one place,
                powered by AI.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="bg-surface rounded-xl border border-border p-5 hover:shadow-md hover:border-brand-200 transition-all duration-200"
                >
                  <div className={`w-10 h-10 rounded-lg ${f.color} flex items-center justify-center mb-4`}>
                    <f.icon size={20} />
                  </div>
                  <h3 className="font-semibold text-text-primary mb-2">{f.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Journey strip ── */}
        <section id="about" className="py-16 bg-brand-950 text-white">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">One connected journey</h2>
              <p className="text-brand-300 text-sm">From learning to landing your dream role</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs md:text-sm font-medium">
              {[
                "Profile",
                "Learn",
                "Assess",
                "Analyze",
                "Close Skill Gaps",
                "Build Portfolio",
                "Polish Resume",
                "Interview Prep",
                "Career Roadmap",
                "Job Ready",
              ].map((item, i, arr) => (
                <div key={item} className="flex items-center gap-2">
                  <span className="bg-brand-800/60 border border-brand-700 text-brand-300 px-3 py-1.5 rounded-full">
                    {item}
                  </span>
                  {i < arr.length - 1 && (
                    <ChevronRight size={14} className="text-brand-600 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section id="how-it-works" className="py-20 bg-surface">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                How it works
              </h2>
              <p className="text-text-secondary text-lg">
                Five steps to career success, powered by AI at every stage.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
              {steps.map((s, i) => (
                <div key={s.step} className="flex flex-col items-center text-center relative">
                  <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white font-bold text-lg flex items-center justify-center mb-4 shadow-lg shadow-brand-200">
                    {s.step}
                  </div>
                  <h3 className="font-semibold text-text-primary mb-2 text-sm">{s.title}</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">{s.desc}</p>
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute top-6 left-[calc(50%+24px)] right-0 h-px bg-border" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-20 bg-gradient-to-br from-brand-600 to-brand-800 text-white">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <GraduationCap size={48} className="mx-auto mb-6 text-brand-200" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to accelerate your career?
            </h2>
            <p className="text-brand-100 text-lg mb-8">
              Learn with purpose. Grow with confidence. From skills to career.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-white text-brand-700 font-bold px-8 py-3 rounded-xl hover:bg-brand-50 transition-colors shadow-lg"
              >
                Start for Free <ArrowRight size={16} />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 border-2 border-white/40 text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/10 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="bg-slate-900 text-slate-400 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-brand-600 flex items-center justify-center">
              <Sparkles size={12} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-200">SkillPath AI</span>
          </div>
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} SkillPath AI. AI-Powered Adaptive Learning & Career Development Platform.
          </p>
          <div className="flex gap-4 text-xs">
            <Link href="/login" className="hover:text-slate-200 transition-colors">Login</Link>
            <Link href="/register" className="hover:text-slate-200 transition-colors">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
