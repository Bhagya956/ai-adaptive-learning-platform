"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye, EyeOff, Mail, Lock, User, Sparkles,
  GraduationCap, Building2, Users, CheckCircle2,
  ChevronLeft, Search,
} from "lucide-react";
import api from "@/src/services/api";
import { useAuthStore } from "@/src/store/authStore";
import { useToast } from "@/src/components/ui/Toast";
import Button from "@/src/components/ui/Button";
import Input from "@/src/components/ui/Input";

// ─── Types ────────────────────────────────────────────────────────────────────
type MainRole = "student" | "educator" | "organization";
type StudentSubType = "independent" | "mentor_based" | "organization_based";
type EducatorSubType = "independent" | "organization_based";

interface TargetItem { _id: string; name: string; email: string; currentRole?: string }

// ─── Schema ───────────────────────────────────────────────────────────────────
const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    role: z.enum(["student", "educator", "organization"]),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

// ─── Role config ──────────────────────────────────────────────────────────────
const roles = [
  {
    value: "student" as MainRole,
    label: "Student",
    description: "Learn, develop skills, and build your career",
    icon: GraduationCap,
    color: "border-brand-300 bg-brand-50 text-brand-700",
    activeColor: "border-brand-600 bg-brand-600 text-white",
  },
  {
    value: "educator" as MainRole,
    label: "Educator / Mentor",
    description: "Guide learners and track their progress",
    icon: Users,
    color: "border-emerald-300 bg-emerald-50 text-emerald-700",
    activeColor: "border-emerald-600 bg-emerald-600 text-white",
  },
  {
    value: "organization" as MainRole,
    label: "Organization",
    description: "Manage mentors, students, and team analytics",
    icon: Building2,
    color: "border-violet-300 bg-violet-50 text-violet-700",
    activeColor: "border-violet-600 bg-violet-600 text-white",
  },
] as const;

// ─── Sub-type selectors ───────────────────────────────────────────────────────
const studentSubTypes = [
  {
    value: "independent" as StudentSubType,
    label: "Independent Student",
    description: "Learn on your own with full platform access",
    color: "border-brand-200 hover:border-brand-500",
    activeColor: "border-brand-600 bg-brand-50",
  },
  {
    value: "mentor_based" as StudentSubType,
    label: "Mentor-Based Student",
    description: "Learn under the guidance of a specific mentor",
    color: "border-emerald-200 hover:border-emerald-500",
    activeColor: "border-emerald-600 bg-emerald-50",
  },
  {
    value: "organization_based" as StudentSubType,
    label: "Organization Student",
    description: "Join an organization's learning program",
    color: "border-violet-200 hover:border-violet-500",
    activeColor: "border-violet-600 bg-violet-50",
  },
];

const educatorSubTypes = [
  {
    value: "independent" as EducatorSubType,
    label: "Independent Mentor",
    description: "Work independently and take on your own learners",
    color: "border-emerald-200 hover:border-emerald-500",
    activeColor: "border-emerald-600 bg-emerald-50",
  },
  {
    value: "organization_based" as EducatorSubType,
    label: "Organization-Based Mentor",
    description: "Join an organization as a mentor/educator",
    color: "border-violet-200 hover:border-violet-500",
    activeColor: "border-violet-600 bg-violet-50",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const toast = useToast();

  // Form
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [isLoading, setIsLoading]       = useState(false);

  // Multi-step state
  const [step, setStep]                         = useState<"role" | "subtype" | "select_target" | "form">("role");
  const [selectedRole, setSelectedRole]         = useState<MainRole | null>(null);
  const [studentSubType, setStudentSubType]     = useState<StudentSubType | null>(null);
  const [educatorSubType, setEducatorSubType]   = useState<EducatorSubType | null>(null);
  const [selectedTarget, setSelectedTarget]     = useState<TargetItem | null>(null);
  const [targetSearch, setTargetSearch]         = useState("");

  // Remote lists
  const [mentors, setMentors]         = useState<TargetItem[]>([]);
  const [organizations, setOrganizations] = useState<TargetItem[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "student" },
  });
  const formRole = watch("role");

  // ── Sync formRole when role card is picked ───────────────────────────────
  const pickRole = (r: MainRole) => {
    setSelectedRole(r);
    setValue("role", r);
    setStudentSubType(null);
    setEducatorSubType(null);
    setSelectedTarget(null);

    if (r === "organization") {
      // Organizations go straight to the form — no sub-type step needed
      setStep("form");
    } else {
      setStep("subtype");
    }
  };

  // ── After sub-type is chosen ─────────────────────────────────────────────
  const pickStudentSubType = async (t: StudentSubType) => {
    setStudentSubType(t);
    setSelectedTarget(null);
    if (t === "independent") {
      setStep("form");
    } else if (t === "mentor_based") {
      setLoadingList(true);
      try {
        const r = await api.get("/auth/mentors");
        setMentors(r.data);
      } catch {
        toast.error("Load failed", "Could not load available mentors.");
      } finally {
        setLoadingList(false);
      }
      setStep("select_target");
    } else {
      setLoadingList(true);
      try {
        const r = await api.get("/auth/organizations");
        setOrganizations(r.data);
      } catch {
        toast.error("Load failed", "Could not load available organizations.");
      } finally {
        setLoadingList(false);
      }
      setStep("select_target");
    }
  };

  const pickEducatorSubType = async (t: EducatorSubType) => {
    setEducatorSubType(t);
    setSelectedTarget(null);
    if (t === "independent") {
      setStep("form");
    } else {
      setLoadingList(true);
      try {
        const r = await api.get("/auth/organizations");
        setOrganizations(r.data);
      } catch {
        toast.error("Load failed", "Could not load available organizations.");
      } finally {
        setLoadingList(false);
      }
      setStep("select_target");
    }
  };

  // ── Target list (mentors / organizations) ────────────────────────────────
  const targetList: TargetItem[] = studentSubType === "mentor_based"
    ? mentors
    : organizations;

  const filteredTargets = targetList.filter((t) =>
    t.name.toLowerCase().includes(targetSearch.toLowerCase()) ||
    t.email.toLowerCase().includes(targetSearch.toLowerCase())
  );

  // ── Submit ────────────────────────────────────────────────────────────────
  const onSubmit = async (data: RegisterFormData) => {
    // Validate target selected when needed
    if (
      (studentSubType === "mentor_based" || studentSubType === "organization_based" ||
       educatorSubType === "organization_based") &&
      !selectedTarget
    ) {
      toast.warning("Selection required", "Please select a mentor or organization first.");
      setStep("select_target");
      return;
    }

    setIsLoading(true);
    try {
      const payload: Record<string, string | undefined> = {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      };

      // Attach sub-type fields — backend validates and sets accountStatus
      if (data.role === "student" && studentSubType) {
        payload.studentType = studentSubType;
        if (studentSubType === "mentor_based" && selectedTarget) {
          payload.mentorId = selectedTarget._id;
        }
        if (studentSubType === "organization_based" && selectedTarget) {
          payload.organizationId = selectedTarget._id;
        }
      }
      if (data.role === "educator" && educatorSubType) {
        payload.educatorType = educatorSubType;
        if (educatorSubType === "organization_based" && selectedTarget) {
          payload.organizationId = selectedTarget._id;
        }
      }

      const response = await api.post("/auth/register", payload);

      // Pending account — backend returns no token
      if (response.data.pending) {
        toast.success("Request submitted!", response.data.message);
        router.push("/login");
        return;
      }

      // Active account — auto-login
      if (response.data.token) {
        const { user, token } = response.data;
        setAuth(user, token);
        localStorage.setItem("token", token);
        toast.success("Account created!", `Welcome, ${user.name}!`);
        if (user.role === "admin")              router.push("/admin");
        else if (user.role === "educator")      router.push("/educator/dashboard");
        else if (user.role === "organization")  router.push("/organization/dashboard");
        else                                    router.push("/dashboard");
        return;
      }

      toast.success("Account created!", "You can now sign in.");
      router.push("/login");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Registration failed. Please try again.";
      toast.error("Registration failed", msg);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Step labels ──────────────────────────────────────────────────────────
  const stepLabel =
    step === "role"          ? "Create your account" :
    step === "subtype"       ? selectedRole === "student" ? "How would you like to learn?" : "How would you like to work?" :
    step === "select_target" ? studentSubType === "mentor_based" ? "Select a mentor" : "Select an organization" :
    "Almost there";

  const stepDesc =
    step === "role"          ? "Choose how you want to use SkillPath" :
    step === "subtype"       ? "Select your learning or working preference" :
    step === "select_target" ? "Choose from the available options below" :
    "Fill in your account details";

  // ─── Shared left panel ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-blue-50/30 to-brand-50/30">
      {/* Left */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-brand-600 via-violet-600 to-blue-600 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/8 blur-2xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-white/8 blur-2xl" />
        </div>
        <Link href="/" className="flex items-center gap-2 relative">
          <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
            <Sparkles size={15} className="text-white" />
          </div>
          <span className="text-white font-bold text-sm">SkillPath</span>
        </Link>
        <div className="relative">
          <h2 className="text-3xl font-bold text-white leading-tight mb-4">
            Your journey starts here.<br />
            <span className="text-white/70">Learn smarter.</span>
          </h2>
          <p className="text-white/60 text-sm leading-relaxed max-w-sm">
            Join thousands of learners and professionals building their skills with intelligent guidance.
          </p>
        </div>
        <p className="text-white/30 text-xs relative">© {new Date().getFullYear()} SkillPath</p>
      </div>

      {/* Right */}
      <div className="flex-1 flex items-start justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-lg py-8">
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 mb-6 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-600 to-blue-500 flex items-center justify-center">
              <Sparkles size={15} className="text-white" />
            </div>
            <span className="font-bold text-text-primary">SkillPath</span>
          </Link>

          {/* Step header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-text-primary">{stepLabel}</h1>
            <p className="text-text-secondary text-sm mt-1">{stepDesc}</p>
          </div>

          {/* Back button */}
          {step !== "role" && (
            <button
              type="button"
              onClick={() => {
                if (step === "subtype")        { setStep("role"); setSelectedRole(null); }
                else if (step === "select_target") { setStep("subtype"); setSelectedTarget(null); setTargetSearch(""); }
                else if (step === "form")      {
                  if (selectedRole === "organization") setStep("role");
                  else if (studentSubType === "independent" || educatorSubType === "independent") setStep("subtype");
                  else setStep("select_target");
                }
              }}
              className="flex items-center gap-1.5 text-sm text-text-muted hover:text-brand-600 mb-5 transition-colors font-medium"
            >
              <ChevronLeft size={15} /> Back
            </button>
          )}

          <div className="bg-white rounded-2xl border border-slate-100 shadow-lg p-7 space-y-4">

          {/* ── STEP: Role ── */}
          {step === "role" && (
            <div className="grid grid-cols-1 gap-3">
              {roles.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => pickRole(r.value)}
                  className={[
                    "flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-150 text-left w-full",
                    "border-border bg-surface hover:border-slate-300 text-text-secondary hover:bg-surface-3",
                  ].join(" ")}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${r.color}`}>
                    <r.icon size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{r.label}</p>
                    <p className="text-xs text-text-muted leading-snug">{r.description}</p>
                  </div>
                </button>
              ))}
              <p className="text-center text-sm text-text-secondary pt-1">
                Already have an account?{" "}
                <Link href="/login" className="text-brand-600 font-semibold hover:text-brand-700 transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          )}

          {/* ── STEP: Sub-type ── */}
          {step === "subtype" && selectedRole === "student" && (
            <div className="space-y-3">
              {studentSubTypes.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => pickStudentSubType(t.value)}
                  className={[
                    "w-full flex items-start gap-4 p-4 rounded-xl border-2 transition-all duration-150 text-left",
                    "border-border bg-surface hover:bg-surface-3",
                    t.color,
                  ].join(" ")}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary">{t.label}</p>
                    <p className="text-xs text-text-muted mt-0.5 leading-snug">{t.description}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {step === "subtype" && selectedRole === "educator" && (
            <div className="space-y-3">
              {educatorSubTypes.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => pickEducatorSubType(t.value)}
                  className={[
                    "w-full flex items-start gap-4 p-4 rounded-xl border-2 transition-all duration-150 text-left",
                    "border-border bg-surface hover:bg-surface-3",
                    t.color,
                  ].join(" ")}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary">{t.label}</p>
                    <p className="text-xs text-text-muted mt-0.5 leading-snug">{t.description}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* ── STEP: Select target (mentor / org) ── */}
          {step === "select_target" && (
            <div className="space-y-3">
              {loadingList ? (
                <div className="py-10 text-center text-text-muted text-sm">Loading…</div>
              ) : targetList.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-text-secondary text-sm">
                    {studentSubType === "mentor_based"
                      ? "No independent mentors are currently available."
                      : "No organizations are currently available."}
                  </p>
                  <p className="text-text-muted text-xs mt-1">Please check back later.</p>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                      type="text"
                      placeholder={studentSubType === "mentor_based" ? "Search mentors…" : "Search organizations…"}
                      value={targetSearch}
                      onChange={(e) => setTargetSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-border rounded-xl bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {filteredTargets.length === 0 ? (
                      <p className="text-center text-sm text-text-muted py-6">No results found.</p>
                    ) : filteredTargets.map((t) => {
                      const isSelected = selectedTarget?._id === t._id;
                      return (
                        <button
                          key={t._id}
                          type="button"
                          onClick={() => setSelectedTarget(t)}
                          className={[
                            "w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-150 text-left",
                            isSelected
                              ? "border-brand-600 bg-brand-50"
                              : "border-border bg-surface hover:border-brand-300 hover:bg-surface-3",
                          ].join(" ")}
                        >
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${isSelected ? "bg-brand-600 text-white" : "bg-surface-3 text-text-secondary"}`}>
                            {t.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-text-primary truncate">{t.name}</p>
                            <p className="text-xs text-text-muted truncate">{t.currentRole || t.email}</p>
                          </div>
                          {isSelected && <CheckCircle2 size={18} className="text-brand-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                  {selectedTarget && (
                    <div className="bg-brand-50 border border-brand-200 rounded-xl p-3 text-sm text-brand-700">
                      Selected: <strong>{selectedTarget.name}</strong>
                    </div>
                  )}
                  <Button
                    type="button"
                    className="w-full"
                    disabled={!selectedTarget}
                    onClick={() => setStep("form")}
                  >
                    Continue
                  </Button>
                </>
              )}
            </div>
          )}

          {/* ── STEP: Form ── */}
          {step === "form" && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              {/* Context reminder */}
              {selectedTarget && (
                <div className="flex items-center gap-2 px-3 py-2.5 bg-surface-3 rounded-xl border border-border text-sm">
                  <CheckCircle2 size={15} className="text-success shrink-0" />
                  <span className="text-text-secondary">
                    {studentSubType === "mentor_based" ? "Mentor: " : "Organization: "}
                    <strong className="text-text-primary">{selectedTarget.name}</strong>
                    <span className="text-text-muted ml-1 text-xs">(pending approval after signup)</span>
                  </span>
                </div>
              )}
              {(studentSubType === "independent" || educatorSubType === "independent") && (
                <div className="flex items-center gap-2 px-3 py-2.5 bg-success-bg rounded-xl border border-green-200 text-sm">
                  <CheckCircle2 size={15} className="text-success shrink-0" />
                  <span className="text-text-secondary">
                    Independent — your account will be <strong>active immediately</strong> after signup.
                  </span>
                </div>
              )}
              {selectedRole === "organization" && (
                <div className="flex items-center gap-2 px-3 py-2.5 bg-success-bg rounded-xl border border-green-200 text-sm">
                  <CheckCircle2 size={15} className="text-success shrink-0" />
                  <span className="text-text-secondary">
                    Organization account — active immediately after signup.
                  </span>
                </div>
              )}

              <Input label="Full name" type="text" placeholder="Jane Smith" autoComplete="name"
                leftIcon={<User size={15} />} error={errors.name?.message} {...register("name")} />

              <Input label="Email address" type="email" placeholder="you@example.com" autoComplete="email"
                leftIcon={<Mail size={15} />} error={errors.email?.message} {...register("email")} />

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-text-primary">Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                  <input type={showPassword ? "text" : "password"} placeholder="Min. 6 characters"
                    autoComplete="new-password"
                    className={["w-full rounded-xl border bg-surface text-text-primary placeholder:text-text-muted text-sm transition-colors duration-150 pl-9 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400",
                      errors.password ? "border-danger" : "border-border hover:border-slate-300"].join(" ")}
                    {...register("password")} />
                  <button type="button" onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary" aria-label="Toggle password">
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-danger">{errors.password.message}</p>}
              </div>

              {/* Confirm password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-text-primary">Confirm password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                  <input type={showConfirm ? "text" : "password"} placeholder="Repeat your password"
                    autoComplete="new-password"
                    className={["w-full rounded-xl border bg-surface text-text-primary placeholder:text-text-muted text-sm transition-colors duration-150 pl-9 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400",
                      errors.confirmPassword ? "border-danger" : "border-border hover:border-slate-300"].join(" ")}
                    {...register("confirmPassword")} />
                  <button type="button" onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary" aria-label="Toggle confirm">
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-xs text-danger">{errors.confirmPassword.message}</p>}
              </div>

              <Button type="submit" loading={isLoading} className="w-full" size="lg">
                {selectedTarget ? "Submit Request" : "Create Account"}
              </Button>
            </form>
          )}

          {step !== "role" && (
            <p className="text-center text-sm text-text-secondary mt-5">
              Already have an account?{" "}
              <Link href="/login" className="text-brand-600 font-semibold hover:text-brand-700 transition-colors">
                Sign in
              </Link>
            </p>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
