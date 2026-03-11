"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { showErrorToast, showSuccessToast } from "@/components/ui/app-toast";
import { useRegisterMutation } from "@/lib/tanstack/auth-mutations";
import { cn } from "@/lib/utils";

type RegisterFormValues = {
  name: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

type RegisterFormErrors = Partial<Record<keyof RegisterFormValues, string>>;

const initialFormValues: RegisterFormValues = {
  name: "",
  username: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

export default function RegisterPage() {
  const router = useRouter();
  const registerMutation = useRegisterMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formValues, setFormValues] = useState<RegisterFormValues>(
    initialFormValues
  );
  const [formErrors, setFormErrors] = useState<RegisterFormErrors>({});
  const [submitErrorMessage, setSubmitErrorMessage] = useState("");
  const [isShaking, setIsShaking] = useState(false);

  function triggerErrorAnimation() {
    setIsShaking(false);
    requestAnimationFrame(() => setIsShaking(true));
    window.setTimeout(() => setIsShaking(false), 420);
  }

  function fieldWrapperClass(hasError: boolean) {
    return cn(
      "flex h-12 items-center rounded-[18px] border border-neutral-900 box-border bg-neutral-950 px-5 transition-[border-color,box-shadow] duration-200",
      "focus-within:border-[var(--primary-200)] focus-within:shadow-[0_0_0_3px_rgba(127,81,249,0.28),0_14px_28px_rgba(105,54,242,0.24)]",
      hasError && "border-red-500 shadow-[0_0_0_1px_rgba(239,68,68,0.4)]"
    );
  }

  function updateField<K extends keyof RegisterFormValues>(
    field: K,
    value: RegisterFormValues[K]
  ) {
    setFormValues((previousValues) => ({
      ...previousValues,
      [field]: value,
    }));

    setFormErrors((previousErrors) => {
      if (!previousErrors[field]) {
        return previousErrors;
      }

      const nextErrors = { ...previousErrors };
      delete nextErrors[field];
      return nextErrors;
    });
  }

  function validateForm(values: RegisterFormValues): RegisterFormErrors {
    const errors: RegisterFormErrors = {};
    const normalizedPhone = values.phone.replace(/\s+/g, "");
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const usernamePattern = /^[a-zA-Z0-9._]+$/;
    const phonePattern = /^\+?\d{10,15}$/;

    if (!values.name.trim()) {
      errors.name = "Name wajib diisi";
    }

    if (!values.username.trim()) {
      errors.username = "Username wajib diisi";
    } else if (!usernamePattern.test(values.username.trim())) {
      errors.username = "Username hanya boleh huruf, angka, titik, atau underscore";
    }

    if (!values.email.trim()) {
      errors.email = "Email wajib diisi";
    } else if (!emailPattern.test(values.email.trim())) {
      errors.email = "Format email tidak valid";
    }

    if (!values.phone.trim()) {
      errors.phone = "Nomor HP wajib diisi";
    } else if (!phonePattern.test(normalizedPhone)) {
      errors.phone = "Nomor HP harus 10-15 digit angka";
    }

    if (!values.password) {
      errors.password = "Password wajib diisi";
    } else if (values.password.length < 6) {
      errors.password = "Password minimal 6 karakter";
    }

    if (!values.confirmPassword) {
      errors.confirmPassword = "Konfirmasi password wajib diisi";
    } else if (values.confirmPassword !== values.password) {
      errors.confirmPassword = "Konfirmasi password tidak sama";
    }

    return errors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitErrorMessage("");

    const errors = validateForm(formValues);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setSubmitErrorMessage("Periksa kembali data registrasi kamu.");
      triggerErrorAnimation();
      showErrorToast("Validasi gagal", {
        description: "Periksa kembali input yang wajib diisi.",
      });
      return;
    }

    try {
      const response = await registerMutation.mutateAsync({
        name: formValues.name.trim(),
        username: formValues.username.trim(),
        email: formValues.email.trim(),
        phone: formValues.phone.replace(/\s+/g, ""),
        password: formValues.password,
      });

      showSuccessToast(response.message, {
        description: `Akun ${response.data.user.username} berhasil dibuat`,
      });
      setFormValues(initialFormValues);
      setFormErrors({});
      setSubmitErrorMessage("");
      setShowPassword(false);
      setShowConfirmPassword(false);
      router.push("/login");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal melakukan registrasi";

      setSubmitErrorMessage(message);
      triggerErrorAnimation();
      showErrorToast("Registrasi gagal", { description: message });
    }
  }

  function renderFieldError(field: keyof RegisterFormValues) {
    if (!formErrors[field]) {
      return null;
    }

    return (
      <p className="text-xs leading-5 font-medium text-red-400 animate-in fade-in slide-in-from-top-1 duration-200">
        {formErrors[field]}
      </p>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,var(--base-pure-black)_0%,var(--base-pure-black)_64%,rgba(0,0,0,0.98)_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-66vh] left-1/2 h-[126vh] w-[170vw] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(98%_92%_at_50%_8%,rgba(5,3,14,0.98)_0%,rgba(14,6,36,0.96)_24%,rgba(31,13,74,0.92)_44%,rgba(50,23,112,0.88)_58%,rgba(73,36,157,0.86)_70%,rgba(95,49,214,0.84)_82%,rgba(118,72,246,0.82)_92%,rgba(127,81,249,0.8)_100%)] blur-[34px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-44vh] left-1/2 h-[98vh] w-[146vw] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(74%_62%_at_50%_100%,rgba(127,81,249,0.8)_0%,rgba(127,81,249,0.6)_34%,rgba(127,81,249,0.36)_58%,rgba(127,81,249,0.16)_78%,rgba(127,81,249,0)_100%)] blur-[58px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[19vh] left-1/2 h-[62vh] w-[132vw] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(76%_76%_at_50%_46%,rgba(0,0,0,0.99)_0%,rgba(0,0,0,0.92)_34%,rgba(0,0,0,0.3)_68%,rgba(0,0,0,0)_100%)] blur-[30px]"
      />

      <main className="relative z-10 grid min-h-screen place-items-center px-6 py-8">
        <Card
          className={cn(
            "grid w-full gap-4 md:gap-6 rounded-3xl border border-neutral-900 box-border bg-black/20 px-4 py-8 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset] backdrop-blur-[2px] md:w-111.5 md:px-6 md:py-10",
            isShaking && "animate-shake-x"
          )}
        >
          <header className="grid gap-4 md:gap-6">
            <div className="flex items-center justify-center gap-3">
              <Image
                src="/icon-sociality.svg"
                alt="Sociality icon"
                width={30}
                height={30}
                priority
              />
              <span className="display-xs leading-none font-bold">Sociality</span>
            </div>
            <h1 className="text-center text-xl font-bold md:display-xs">
              Register
            </h1>
          </header>

          <form className="grid gap-5" onSubmit={handleSubmit} noValidate>
            <div className="grid gap-0.5">
              <Label className="text-sm font-bold" htmlFor="name">
                Name
              </Label>
              <div className={fieldWrapperClass(Boolean(formErrors.name))}>
                <Input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Enter your name"
                  className="text-md h-full w-full border-0 bg-transparent p-0 text-base-pure-white shadow-none placeholder:font-semibold placeholder:text-neutral-600 focus-visible:border-transparent focus-visible:ring-0"
                  value={formValues.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  aria-invalid={Boolean(formErrors.name)}
                  disabled={registerMutation.isPending}
                />
              </div>
              {renderFieldError("name")}
            </div>

            <div className="grid gap-0.5">
              <Label className="text-sm font-bold" htmlFor="username">
                Username
              </Label>
              <div className={fieldWrapperClass(Boolean(formErrors.username))}>
                <Input
                  id="username"
                  type="text"
                  autoComplete="username"
                  placeholder="Enter your username"
                  className="text-md h-full w-full border-0 bg-transparent p-0 text-base-pure-white shadow-none placeholder:font-semibold placeholder:text-neutral-600 focus-visible:border-transparent focus-visible:ring-0"
                  value={formValues.username}
                  onChange={(event) =>
                    updateField("username", event.target.value)
                  }
                  aria-invalid={Boolean(formErrors.username)}
                  disabled={registerMutation.isPending}
                />
              </div>
              {renderFieldError("username")}
            </div>

            <div className="grid gap-0.5">
              <Label className="text-sm font-bold" htmlFor="email">
                Email
              </Label>
              <div className={fieldWrapperClass(Boolean(formErrors.email))}>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  className="text-md h-full w-full border-0 bg-transparent p-0 text-base-pure-white shadow-none placeholder:font-semibold placeholder:text-neutral-600 focus-visible:border-transparent focus-visible:ring-0"
                  value={formValues.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  aria-invalid={Boolean(formErrors.email)}
                  disabled={registerMutation.isPending}
                />
              </div>
              {renderFieldError("email")}
            </div>

            <div className="grid gap-0.5">
              <Label className="text-sm font-bold" htmlFor="phone">
                Number Phone
              </Label>
              <div className={fieldWrapperClass(Boolean(formErrors.phone))}>
                <Input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="Enter your number phone"
                  className="text-md h-full w-full border-0 bg-transparent p-0 text-base-pure-white shadow-none placeholder:font-semibold placeholder:text-neutral-600 focus-visible:border-transparent focus-visible:ring-0"
                  value={formValues.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  aria-invalid={Boolean(formErrors.phone)}
                  disabled={registerMutation.isPending}
                />
              </div>
              {renderFieldError("phone")}
            </div>

            <div className="grid gap-0.5">
              <Label className="text-sm font-bold" htmlFor="register-password">
                Password
              </Label>
              <InputGroup className={fieldWrapperClass(Boolean(formErrors.password))}>
                <InputGroupInput
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Enter your password"
                  className="text-md h-full w-full p-0 text-white placeholder:font-semibold placeholder:text-neutral-600 focus-visible:border-transparent focus-visible:ring-0"
                  value={formValues.password}
                  onChange={(event) =>
                    updateField("password", event.target.value)
                  }
                  aria-invalid={Boolean(formErrors.password)}
                  disabled={registerMutation.isPending}
                />
                <InputGroupAddon align="inline-end" className="pr-0">
                  <InputGroupButton
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-transparent hover:text-neutral-300"
                    aria-label={
                      showPassword ? "Hide password value" : "Show password value"
                    }
                    onClick={() => setShowPassword((value) => !value)}
                    disabled={registerMutation.isPending}
                  >
                    {showPassword ? (
                      <EyeOff className="h-6 w-6" strokeWidth={2.2} />
                    ) : (
                      <Eye className="h-6 w-6" strokeWidth={2.2} />
                    )}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              {renderFieldError("password")}
            </div>

            <div className="grid gap-0.5">
              <Label className="text-sm font-bold" htmlFor="confirm-password">
                Confirm Password
              </Label>
              <InputGroup
                className={fieldWrapperClass(Boolean(formErrors.confirmPassword))}
              >
                <InputGroupInput
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Enter your confirm password"
                  className="text-md h-full w-full p-0 text-white placeholder:font-semibold placeholder:text-neutral-600 focus-visible:border-transparent focus-visible:ring-0"
                  value={formValues.confirmPassword}
                  onChange={(event) =>
                    updateField("confirmPassword", event.target.value)
                  }
                  aria-invalid={Boolean(formErrors.confirmPassword)}
                  disabled={registerMutation.isPending}
                />
                <InputGroupAddon align="inline-end" className="pr-0">
                  <InputGroupButton
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-transparent hover:text-neutral-300"
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password value"
                        : "Show confirm password value"
                    }
                    onClick={() => setShowConfirmPassword((value) => !value)}
                    disabled={registerMutation.isPending}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-6 w-6" strokeWidth={2.2} />
                    ) : (
                      <Eye className="h-6 w-6" strokeWidth={2.2} />
                    )}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              {renderFieldError("confirmPassword")}
            </div>

            <Button
              type="submit"
              variant="ghost"
              disabled={registerMutation.isPending}
              className={cn(
                "text-md flex h-11 items-center justify-center rounded-full bg-primary-300 font-bold text-base-pure-white transition-transform duration-200 hover:scale-[1.01] hover:bg-primary-200 hover:text-base-pure-white active:scale-[0.99] md:h-12",
                registerMutation.isPending && "animate-pulse cursor-wait"
              )}
            >
              {registerMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <LoaderCircle className="size-4 animate-spin" />
                  Registering...
                </span>
              ) : (
                "Submit"
              )}
            </Button>

            {submitErrorMessage ? (
              <p className="text-center text-xs leading-5 font-medium text-red-400 animate-in fade-in slide-in-from-top-1 duration-200">
                {submitErrorMessage}
              </p>
            ) : null}
          </form>

          <p className="text-sm md:text-md flex items-center justify-center gap-2 leading-none font-bold text-white">
            <span>Already have an account?</span>
            <Link href="/login" className="text-primary-200">
              Log in
            </Link>
          </p>
        </Card>
      </main>
    </div>
  );
}
