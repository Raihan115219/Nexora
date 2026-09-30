"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2 } from "lucide-react";
import { PASSWORD_MIN_LENGTH } from "@/config/site";
import { checkReferralCode, register as registerUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useHydrated } from "@/store/hooks";

const schema = z
  .object({
    name: z.string().trim().min(2, "Full name is required"),
    email: z.string().min(1, "Email is required").email("Enter a valid email address"),
    password: z.string().min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    referralCode: z.string().trim().min(1, "Referral code is required"),
    phone: z
      .string()
      .trim()
      .optional()
      .refine((v) => !v || /^[+\d][\d\s()-]{6,}$/.test(v), "Enter a valid phone number"),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });
type Values = z.infer<typeof schema>;

export function RegisterForm() {
  const router = useRouter();
  const toast = useToast();
  const params = useSearchParams();
  const hydrated = useHydrated();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      referralCode: params.get("ref") ?? "",
      phone: "",
    },
  });

  const code = useWatch({ control, name: "referralCode" });
  const sponsor = useMemo(() => {
    if (!hydrated || !code?.trim()) return null;
    const result = checkReferralCode(code);
    return result.ok ? result.data.sponsorName : null;
  }, [code, hydrated]);

  async function onSubmit(values: Values) {
    setFormError(null);
    const result = await registerUser({
      name: values.name,
      email: values.email,
      password: values.password,
      referralCode: values.referralCode,
      phone: values.phone,
    });
    if (!result.ok) {
      if (result.error.toLowerCase().includes("referral")) setError("referralCode", { message: result.error });
      else setFormError(result.error);
      return;
    }
    toast.success("Account created", "Your wallet is ready and your referral was applied.");
    router.replace("/dashboard");
  }

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Create Account</h1>
      <p className="mt-1 mb-6 text-sm text-secondary">Join the Nexora founder network.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input label="Full Name" autoComplete="name" placeholder="Jane Cooper" error={errors.name?.message} {...register("name")} />
        <Input label="Email" type="email" autoComplete="email" placeholder="you@example.com" error={errors.email?.message} {...register("email")} />
        <Input label="Password" type="password" autoComplete="new-password" placeholder="At least 8 characters" error={errors.password?.message} {...register("password")} />
        <Input label="Confirm Password" type="password" autoComplete="new-password" placeholder="Repeat password" error={errors.confirmPassword?.message} {...register("confirmPassword")} />
        <div>
          <Input
            label="Referral Code"
            placeholder="NXR-XXXXXX"
            autoCapitalize="characters"
            error={errors.referralCode?.message}
            {...register("referralCode")}
          />
          {sponsor && !errors.referralCode && (
            <p className="mt-1.5 flex items-center gap-1.5 px-1 text-xs text-primary">
              <CheckCircle2 className="size-3.5" aria-hidden /> Sponsored by {sponsor}
            </p>
          )}
        </div>
        <Input label="Phone (optional)" type="tel" autoComplete="tel" placeholder="+1 555 000 0000" error={errors.phone?.message} {...register("phone")} />

        {formError && (
          <p role="alert" className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger">
            {formError}
          </p>
        )}
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting} disabled={!hydrated}>
          Create Account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-secondary">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
      <p className="mt-4 text-center text-xs text-dim">
        Demo tip: use referral code <span className="num text-secondary">NXR-ALEX01</span>
      </p>
    </>
  );
}
