"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { DEMO_ACCOUNTS } from "@/config/site";
import { login } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useHydrated } from "@/store/hooks";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
type Values = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const toast = useToast();
  const hydrated = useHydrated();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } });

  async function onSubmit(values: Values) {
    setFormError(null);
    const result = await login(values);
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    toast.success(`Welcome back, ${result.data.name.split(" ")[0]}`);
    router.replace(result.data.role === "admin" ? "/admin" : "/dashboard");
  }

  function fillDemo(kind: keyof typeof DEMO_ACCOUNTS) {
    setValue("email", DEMO_ACCOUNTS[kind].email, { shouldValidate: true });
    setValue("password", DEMO_ACCOUNTS[kind].password, { shouldValidate: true });
  }

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
      <p className="mt-1 mb-6 text-sm text-secondary">Sign in to your Nexora account.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input label="Email" type="email" autoComplete="email" placeholder="you@example.com" error={errors.email?.message} {...register("email")} />
        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password?.message}
          trailing={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="text-dim transition-colors hover:text-fg"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          }
          {...register("password")}
        />
        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-xs text-primary hover:underline">
            Forgot password?
          </Link>
        </div>
        {formError && (
          <p role="alert" className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger">
            {formError}
          </p>
        )}
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting} disabled={!hydrated}>
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-secondary">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Create one
        </Link>
      </p>

      <div className="mt-6 rounded-2xl border border-dashed border-line-2 p-4">
        <p className="text-xs font-medium tracking-wider text-dim uppercase">Demo accounts</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => fillDemo("user")}>
            Member · Alex Morgan
          </Button>
          <Button size="sm" variant="secondary" onClick={() => fillDemo("admin")}>
            Admin
          </Button>
        </div>
        <p className="mt-3 text-xs text-secondary">
          Password: <span className="num text-fg">{DEMO_ACCOUNTS.user.password}</span>
        </p>
      </div>
    </>
  );
}
