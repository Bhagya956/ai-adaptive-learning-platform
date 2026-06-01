"use client";

import { useRouter } from "next/navigation";

import { useForm } from "react-hook-form";

import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";

import api from "@/src/services/api";

import { useAuthStore } from "@/src/store/authStore";

const loginSchema = z.object({
  email: z.email(),

  password: z.string().min(6),
});

type LoginFormData = z.infer<
  typeof loginSchema
>;

export default function LoginPage() {
  const router = useRouter();

  const { setAuth } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (
    data: LoginFormData
  ) => {
    try {
      const response = await api.post(
        "/auth/login",
        data
      );

      console.log("consoling login response",response)

      const { user, token } =
        response.data;

      setAuth(user, token);

      localStorage.setItem(
        "token",
        token
      );

      alert("Login successful");

      router.push("/dashboard");
    } catch (error) {
      console.error(error);

      alert("Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md space-y-4 border p-6 rounded-lg"
      >
        <h1 className="text-2xl font-bold">
          Login
        </h1>

        <div>
          <input
            type="email"
            placeholder="Email"
            {...register("email")}
            className="w-full border p-2 rounded"
          />

          {errors.email && (
            <p className="text-red-500 text-sm">
              Valid email required
            </p>
          )}
        </div>

        <div>
          <input
            type="password"
            placeholder="Password"
            {...register("password")}
            className="w-full border p-2 rounded"
          />

          {errors.password && (
            <p className="text-red-500 text-sm">
              Password required
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-black text-white p-2 rounded"
        >
          Login
        </button>
      </form>
    </div>
  );
}