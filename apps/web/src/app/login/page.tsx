"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Mail, Lock, Sparkles } from "lucide-react";
import api from "@/src/services/api";
import { useAuthStore } from "@/src/store/authStore";
import { useToast } from "@/src/components/ui/Toast";
import Button from "@/src/components/ui/Button";
import Input from "@/src/components/ui/Input";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await api.post("/auth/login", {
        email: data.email,
        password: data.password,
      });
      const { user, token } = response.data;
      setAuth(user, token);
      // Also set legacy token key for pages that still use it
      localStorage.setItem("token", token);
      toast.success("Welcome back!", `Signed in as ${user.name}`);
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
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || "Invalid email or password. Please try again.";
      toast.error("Login failed", msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-surface-2">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-950 via-brand-900 to-slate-900 p-12 flex-col justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <span className="text-white font-bold text-base">SkillPath AI</span>
        </Link>
        <div>
          <h2 className="text-3xl font-bold text-white leading-tight mb-4">
            Learn with purpose.
            <br />
            <span className="text-brand-400">Grow with confidence.</span>
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
            Continue your learning journey. Your AI-powered career roadmap is
            waiting.
          </p>
          <div className="mt-8 space-y-3">
            {[
              "Personalized AI learning paths",
              "Real-time skill gap analysis",
              "Interview prep & resume scoring",
              "Career readiness tracking",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-slate-300">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>
        <p className="text-slate-600 text-xs">
          © {new Date().getFullYear()} SkillPath AI
        </p>
      </div>

      {/* Right panel – form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="font-bold text-text-primary">SkillPath AI</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-text-primary">Welcome back</h1>
            <p className="text-text-secondary text-sm mt-1">
              Sign in to continue your learning journey
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              leftIcon={<Mail size={15} />}
              error={errors.email?.message}
              {...register("email")}
            />

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-text-primary">Password</label>
                <button
                  type="button"
                  className="text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors"
                  onClick={() => toast.info("Forgot password", "Contact your administrator to reset your password.")}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className={[
                    "w-full rounded-lg border bg-surface text-text-primary placeholder:text-text-muted",
                    "text-sm transition-colors duration-150 pl-9 pr-10 py-2.5",
                    "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500",
                    errors.password
                      ? "border-danger focus:ring-danger"
                      : "border-border hover:border-slate-300",
                  ].join(" ")}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-danger">{errors.password.message}</p>
              )}
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-border accent-brand-600"
                {...register("rememberMe")}
              />
              <span className="text-sm text-text-secondary">Remember me</span>
            </label>

            <Button type="submit" loading={isLoading} className="w-full" size="lg">
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-text-secondary mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-brand-600 font-medium hover:text-brand-700 transition-colors">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
