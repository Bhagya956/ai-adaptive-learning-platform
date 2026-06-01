"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// import api from "@/services/api";
import api from "@/src/services/api";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  password: z.string().min(6),
});

type RegisterFormData = z.infer<
  typeof registerSchema
>;

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (
    data: RegisterFormData
  ) => {
    try {
      const response = await api.post(
        "/auth/register",
        data
      );

      console.log(response.data);

      alert("Registration successful");
    } catch (error) {
      console.error(error);

      alert("Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md space-y-4 border p-6 rounded-lg"
      >
        <h1 className="text-2xl font-bold">
          Register
        </h1>

        <div>
          <input
            type="text"
            placeholder="Name"
            {...register("name")}
            className="w-full border p-2 rounded"
          />

          {errors.name && (
            <p className="text-red-500 text-sm">
              Name is required
            </p>
          )}
        </div>

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
              Minimum 6 characters
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-black text-white p-2 rounded"
        >
          Register
        </button>
      </form>
    </div>
  );
}