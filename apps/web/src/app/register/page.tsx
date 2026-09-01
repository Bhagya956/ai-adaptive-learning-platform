"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Mail, Lock, User, Sparkles, GraduationCap, Building2, Users } from "lucide-react";
import api from "@/src/services/api";
import { useAuthStore } from "@/src/store/authStore";
import { useToast } from "@/src/components/ui/Toast";
import Button from "@/src/components/ui/Button";
import Input from "@/src/components/ui/Input";

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

const roles = [
  {
    value: "student",
    label: "Student / Job Seeker",
    description: "Learn, assess skills, and prepare for your career",
    icon: GraduationCap,
    color: "border-brand-300 bg-brand-50 text-brand-700",
    activeColor: "border-brand-600 bg-brand-600 text-white",
  },
  {
    value: "educator",
    label: "Educator / Mentor",
    description: "Guide learners and track their progress",
    icon: Users,
    color: "border-emerald-300 bg-emerald-50 text-emerald-700",
    activeColor: "border-emerald-600 bg-emerald-600 text-white",
  },
  {
    value: "organization",
    label: "Organization",
    description: "Manage teams, analytics, and career readiness",
    icon: Building2,
    color: "border-violet-300 bg-violet-50 text-violet-700",
    activeColor: "border-violet-600 bg-violet-600 text-white",
  },
] as const;

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "student" },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const response = await api.post("/auth/register", {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      });
      // Auto-login after register if token returned, otherwise redirect
      if (response.data.token) {
        const { user, token } = response.data;
        setAuth(user, token);
        localStorage.setItem("token", token);
        toast.success("Account created!", `Welcome to SkillPath AI, ${user.name}`);
        // Route to the correct dashboard based on role
        if (user.role === "admin") {
          router.push("/admin");
        } else if (user.role === "educator") {
          router.push("/educator/dashboard");
        } else if (user.role === "organization") {
          router.push("/organization/dashboard");
        } else {
          router.push("/dashboard");
        }
      } else {
        toast.success("Account created!", "You can now sign in.");
        router.push("/login");
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Registration failed. Please try again.";
      toast.error("Registration failed", msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-surface-2">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-brand-950 via-brand-900 to-slate-900 p-12 flex-col justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <span className="text-white font-bold text-base">SkillPath AI</span>
        </Link>
        <div>
          <h2 className="text-3xl font-bold text-white leading-tight mb-4">
            Your journey starts here.
            <br />
            <span className="text-brand-400">Learn smarter.</span>
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
            Join thousands of learners and professionals building their skills
            with AI-powered guidance.
          </p>
        </div>
        <p className="text-slate-600 text-xs">© {new Date().getFullYear()} SkillPath AI</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-start justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-lg py-8">
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="font-bold text-text-primary">SkillPath AI</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-text-primary">Create your account</h1>
            <p className="text-text-secondary text-sm mt-1">
              Set up your profile in under a minute
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {/* Role selector */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-text-primary">I am a…</label>
              <div className="grid grid-cols-3 gap-2">
                {roles.map((r) => {
                  const isSelected = selectedRole === r.value;
                  return (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setValue("role", r.value)}
                      className={[
                        "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-150 text-center",
                        isSelected
                          ? r.activeColor + " shadow-sm"
                          : "border-border bg-surface hover:border-slate-300 text-text-secondary",
                      ].join(" ")}
                    >
                      <r.icon size={20} />
                      <span className="text-xs font-semibold leading-tight">{r.label}</span>
                    </button>
                  );
                })}
              </div>
              {errors.role && (
                <p className="text-xs text-danger">{errors.role.message}</p>
              )}
            </div>

            <Input
              label="Full name"
              type="text"
              placeholder="Jane Smith"
              autoComplete="name"
              leftIcon={<User size={15} />}
              error={errors.name?.message}
              {...register("name")}
            />

            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              leftIcon={<Mail size={15} />}
              error={errors.email?.message}
              {...register("email")}
            />

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-primary">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                  className={[
                    "w-full rounded-lg border bg-surface text-text-primary placeholder:text-text-muted text-sm",
                    "transition-colors duration-150 pl-9 pr-10 py-2.5",
                    "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500",
                    errors.password ? "border-danger" : "border-border hover:border-slate-300",
                  ].join(" ")}
                  {...register("password")}
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
                  aria-label="Toggle password">
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
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  className={[
                    "w-full rounded-lg border bg-surface text-text-primary placeholder:text-text-muted text-sm",
                    "transition-colors duration-150 pl-9 pr-10 py-2.5",
                    "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500",
                    errors.confirmPassword ? "border-danger" : "border-border hover:border-slate-300",
                  ].join(" ")}
                  {...register("confirmPassword")}
                />
                <button type="button" onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
                  aria-label="Toggle confirm password">
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-danger">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" loading={isLoading} className="w-full" size="lg">
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-text-secondary mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-brand-600 font-medium hover:text-brand-700 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
