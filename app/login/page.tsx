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
import { saveAuthSession } from "@/lib/auth-session";
import { useAppDispatch } from "@/lib/redux/hooks";
import { setAuthSession } from "@/lib/redux/slices/auth-slice";
import { useLoginMutation } from "@/lib/tanstack/auth-mutations";
import { cn } from "@/lib/utils";

type LoginFormValues = {
  email: string;
  password: string;
};

type LoginFormErrors = Partial<Record<keyof LoginFormValues, string>>;

const initialFormValues: LoginFormValues = {
  email: "",
  password: "",
};

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const loginMutation = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [formValues, setFormValues] = useState<LoginFormValues>(
    initialFormValues
  );
  const [isFieldUnlocked, setIsFieldUnlocked] = useState({
    email: false,
    password: false,
  });
  const [formErrors, setFormErrors] = useState<LoginFormErrors>({});
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

  function updateField<K extends keyof LoginFormValues>(
    field: K,
    value: LoginFormValues[K]
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

  function unlockField(field: keyof LoginFormValues) {
    setIsFieldUnlocked((previousState) => {
      if (previousState[field]) {
        return previousState;
      }

      return {
        ...previousState,
        [field]: true,
      };
    });
  }

  function validateForm(values: LoginFormValues): LoginFormErrors {
    const errors: LoginFormErrors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!values.email.trim()) {
      errors.email = "Email wajib diisi";
    } else if (!emailPattern.test(values.email.trim())) {
      errors.email = "Format email tidak valid";
    }

    if (!values.password) {
      errors.password = "Password wajib diisi";
    } else if (values.password.length < 6) {
      errors.password = "Password minimal 6 karakter";
    }

    return errors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitErrorMessage("");

    const errors = validateForm(formValues);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setSubmitErrorMessage("Periksa kembali data login kamu.");
      triggerErrorAnimation();
      showErrorToast("Validasi gagal", {
        description: "Periksa kembali email dan password.",
      });
      return;
    }

    try {
      const response = await loginMutation.mutateAsync({
        email: formValues.email.trim(),
        password: formValues.password,
      });

      saveAuthSession(response.data.token, response.data.user);
      dispatch(
        setAuthSession({
          token: response.data.token,
          user: response.data.user,
        }),
      );
      showSuccessToast(response.message, {
        description: `Selamat datang, ${response.data.user.username}`,
      });
      setFormErrors({});
      setSubmitErrorMessage("");
      router.push("/home");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login gagal";

      setSubmitErrorMessage(message);
      triggerErrorAnimation();
      showErrorToast("Login gagal", { description: message });
    }
  }

  function renderFieldError(field: keyof LoginFormValues) {
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
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,1)_0%,rgba(0,0,0,1)_58%,rgba(2,1,8,0.99)_72%,rgba(12,5,33,0.98)_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-74vh] left-1/2 h-[150vh] w-[196vw] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(92%_90%_at_50%_8%,rgba(4,2,14,0.99)_0%,rgba(16,8,44,0.97)_28%,rgba(37,19,92,0.95)_48%,rgba(62,33,141,0.93)_64%,rgba(90,52,196,0.92)_78%,rgba(122,77,248,0.91)_90%,rgba(141,100,255,0.9)_100%)] blur-[18px] md:bottom-[-78vh] md:h-[156vh] md:w-[176vw]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-53vh] left-1/2 h-[118vh] w-[164vw] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(70%_62%_at_50%_100%,rgba(164,120,255,0.88)_0%,rgba(132,86,249,0.72)_32%,rgba(101,57,220,0.5)_56%,rgba(62,33,154,0.22)_80%,rgba(42,20,109,0)_100%)] blur-[64px] md:bottom-[-47vh] md:h-[108vh] md:w-[148vw]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-9vh] left-1/2 h-[56vh] w-[132vw] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(62%_58%_at_50%_100%,rgba(162,110,255,0.66)_0%,rgba(130,80,246,0.42)_44%,rgba(97,53,206,0.2)_68%,rgba(59,30,141,0)_100%)] blur-[52px] md:bottom-[-14vh] md:h-[50vh] md:w-[112vw]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[16vh] left-1/2 h-[66vh] w-[138vw] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(78%_82%_at_50%_42%,rgba(0,0,0,0.99)_0%,rgba(0,0,0,0.9)_36%,rgba(0,0,0,0.38)_66%,rgba(0,0,0,0)_100%)] blur-[24px] md:bottom-[20vh] md:h-[60vh] md:w-[124vw]"
      />

      <main className="relative z-10 grid min-h-screen place-items-center px-6 py-8">
        <Card
          className={cn(
            "grid w-full gap-4 rounded-3xl border border-neutral-900 box-border bg-black/20 px-4 py-8 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset] backdrop-blur-[2px] md:w-111.5 md:gap-6 md:px-6 md:py-10",
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
              Welcome Back!
            </h1>
          </header>

          <form
            className="grid gap-5"
            onSubmit={handleSubmit}
            noValidate
            autoComplete="off"
          >
            <div className="grid gap-0.5">
              <Label className="text-sm font-bold" htmlFor="email">
                Email
              </Label>
              <div className={fieldWrapperClass(Boolean(formErrors.email))}>
                <Input
                  id="email"
                  type="email"
                  name="login-email-field"
                  autoComplete="off"
                  placeholder="Enter your email"
                  className="text-md h-full w-full border-0 bg-transparent p-0 text-base-pure-white shadow-none placeholder:font-semibold placeholder:text-neutral-600 focus-visible:border-transparent focus-visible:ring-0"
                  value={formValues.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  onFocus={() => unlockField("email")}
                  readOnly={!isFieldUnlocked.email}
                  aria-invalid={Boolean(formErrors.email)}
                  disabled={loginMutation.isPending}
                />
              </div>
              {renderFieldError("email")}
            </div>

            <div className="grid gap-0.5">
              <Label className="text-sm font-bold" htmlFor="password">
                Password
              </Label>
              <InputGroup className={fieldWrapperClass(Boolean(formErrors.password))}>
                <InputGroupInput
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="login-password-field"
                  autoComplete="new-password"
                  placeholder="Enter your password"
                  className="text-md h-full w-full p-0 text-white placeholder:font-semibold placeholder:text-neutral-600 focus-visible:border-transparent focus-visible:ring-0"
                  value={formValues.password}
                  onChange={(event) => updateField("password", event.target.value)}
                  onFocus={() => unlockField("password")}
                  readOnly={!isFieldUnlocked.password}
                  aria-invalid={Boolean(formErrors.password)}
                  disabled={loginMutation.isPending}
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
                    disabled={loginMutation.isPending}
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

            <Button
              type="submit"
              variant="ghost"
              disabled={loginMutation.isPending}
              className={cn(
                "text-md flex h-11 items-center justify-center rounded-full bg-primary-300 font-bold text-base-pure-white transition-transform duration-200 hover:scale-[1.01] hover:bg-primary-200 hover:text-base-pure-white active:scale-[0.99] md:h-12",
                loginMutation.isPending && "animate-pulse cursor-wait"
              )}
            >
              {loginMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <LoaderCircle className="size-4 animate-spin" />
                  Logging in...
                </span>
              ) : (
                "Login"
              )}
            </Button>

            {submitErrorMessage ? (
              <p className="text-center text-xs leading-5 font-medium text-red-400 animate-in fade-in slide-in-from-top-1 duration-200">
                {submitErrorMessage}
              </p>
            ) : null}
          </form>

          <p className="text-sm md:text-md flex items-center justify-center gap-2 leading-none font-bold text-white">
            <span>Don&apos;t have an account?</span>
            <Link href="/register" className="text-primary-200">
              Register
            </Link>
          </p>
        </Card>
      </main>
    </div>
  );
}
