"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Mail, Lock, Sparkles, ArrowRight } from "lucide-react";
import api from "@/src/services/api";
import { useAuthStore } from "@/src/store/authStore";
import { useToast } from "@/src/components/ui/Toast";
import Button from "@/src/components/ui/Button";
import Input from "@/src/components/ui/Input";

const schema = z.object({
  email:      z.string().email("Enter a valid email"),
  password:   z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router    = useRouter();
  const { setAuth } = useAuthStore();
  const toast     = useToast();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email: data.email, password: data.password });
      const { user, token } = res.data;
      setAuth(user, token);
      localStorage.setItem("token", token);
      toast.success("Welcome back!", `Signed in as ${user.name}`);
      if      (user.role === "admin")        router.push("/admin");
      else if (user.role === "educator")     router.push("/educator/dashboard");
      else if (user.role === "organization") router.push("/organization/dashboard");
      else                                   router.push("/dashboard");
    } catch (err: any) {
      const status  = err?.response?.status;
      const payload = err?.response?.data;
      if (status === 403 && payload?.accountStatus === "pending") {
        toast.error("Account pending", payload.message || "Your account is still under review.");
      } else if (status === 403 && payload?.accountStatus === "rejected") {
        toast.error("Account rejected", payload.message || "Your account request was rejected.");
      } else {
        toast.error("Login failed", payload?.message || "Invalid email or password.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-blue-50/30 to-brand-50/30">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-brand-600 via-violet-600 to-blue-600 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/8 blur-2xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-white/8 blur-2xl" />
        </div>
        <Link href="/" className="flex items-center gap-2 relative">
          <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
            <Sparkles size={15} className="text-white" />
          </div>
          <span className="text-white font-bold text-sm">SkillPath AI</span>
        </Link>
        <div className="relative">
          <h2 className="text-3xl font-bold text-white leading-tight mb-4">
            Learn with purpose.<br />
            <span className="text-white/70">Grow with confidence.</span>
          </h2>
          <p className="text-white/60 text-sm leading-relaxed max-w-sm mb-8">
            Continue your learning journey. Your personalised career roadmap is waiting.
          </p>
          <div className="space-y-2.5">
            {["Personalised learning paths", "Real-time skill gap analysis", "Interview prep & mock sessions", "Career readiness tracking"].map((item) => (
              <div key={item} className="flex items-center gap-2.5 text-sm text-white/80">
                <div className="w-1.5 h-1.5 rounded-full bg-white/60 shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>
        <p className="text-white/30 text-xs relative">© {new Date().getFullYear()} SkillPath AI</p>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-600 to-blue-500 flex items-center justify-center">
              <Sparkles size={15} className="text-white" />
            </div>
            <span className="font-bold text-text-primary">SkillPath AI</span>
          </Link>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-lg p-8">
            <div className="mb-7">
              <h1 className="text-2xl font-bold text-text-primary">Welcome back</h1>
              <p className="text-text-secondary text-sm mt-1">Sign in to continue your learning journey</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <Input label="Email address" type="email" placeholder="you@example.com"
                autoComplete="email" leftIcon={<Mail size={14} />} error={errors.email?.message}
                {...register("email")} />

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-text-primary uppercase tracking-wide">Password</label>
                  <button type="button" onClick={() => toast.info("Reset password", "Contact your administrator to reset your password.")}
                    className="text-xs text-brand-600 hover:text-brand-700 font-medium">
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                  <input type={showPw ? "text" : "password"} placeholder="Enter your password"
                    autoComplete="current-password"
                    className={["w-full rounded-xl border bg-white text-text-primary text-sm pl-9 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400 transition-all",
                      errors.password ? "border-danger" : "border-border hover:border-brand-200"].join(" ")}
                    {...register("password")} />
                  <button type="button" onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-brand-600 transition-colors">
                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-danger">{errors.password.message}</p>}
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer select-none pt-1">
                <input type="checkbox" className="w-4 h-4 rounded border-border accent-brand-600" {...register("rememberMe")} />
                <span className="text-sm text-text-secondary">Remember me</span>
              </label>

              <Button type="submit" loading={loading} className="w-full" size="lg" rightIcon={<ArrowRight size={14} />}>
                {loading ? "Signing in…" : "Sign In"}
              </Button>
            </form>

            <p className="text-center text-sm text-text-secondary mt-6">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-brand-600 font-semibold hover:text-brand-700 transition-colors">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
