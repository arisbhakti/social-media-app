"use client";

import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--base-pure-black)] text-[var(--base-pure-white)]">
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
        <section className="grid w-full max-w-[700px] gap-8 rounded-[30px] border border-[rgba(246,249,254,0.16)] bg-[rgba(3,6,12,0.82)] px-8 py-10 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset] backdrop-blur-[2px] md:w-[560px] md:max-w-none md:rounded-[22px] md:px-6 md:py-7">
          <header className="grid place-items-center gap-8">
            <div className="flex items-center gap-3">
              <Image
                src="/icon-sociality.svg"
                alt="Sociality icon"
                width={34}
                height={34}
                priority
              />
              <span className="display-md leading-none font-bold">Sociality</span>
            </div>
            <h1 className="display-lg leading-none font-bold">Register</h1>
          </header>

          <form className="grid gap-6">
            <div className="grid gap-2">
              <label className="text-lg leading-none font-bold" htmlFor="name">
                Name
              </label>
              <div className="flex h-16 items-center rounded-[18px] border border-[rgba(126,145,183,0.24)] bg-[rgba(6,16,31,0.9)] px-5">
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Enter your email"
                  className="text-xl h-full w-full bg-transparent text-[var(--base-pure-white)] placeholder:text-[var(--neutral-500)] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-lg leading-none font-bold" htmlFor="username">
                Username
              </label>
              <div className="flex h-16 items-center rounded-[18px] border border-[rgba(126,145,183,0.24)] bg-[rgba(6,16,31,0.9)] px-5">
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  placeholder="Enter your username"
                  className="text-xl h-full w-full bg-transparent text-[var(--base-pure-white)] placeholder:text-[var(--neutral-500)] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <label
                className="text-lg leading-none font-bold"
                htmlFor="number-phone"
              >
                Number Phone
              </label>
              <div className="flex h-16 items-center rounded-[18px] border border-[rgba(126,145,183,0.24)] bg-[rgba(6,16,31,0.9)] px-5">
                <input
                  id="number-phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="Enter your number phone"
                  className="text-xl h-full w-full bg-transparent text-[var(--base-pure-white)] placeholder:text-[var(--neutral-500)] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <label
                className="text-lg leading-none font-bold"
                htmlFor="register-password"
              >
                Password
              </label>
              <div className="flex h-16 items-center rounded-[18px] border border-[rgba(126,145,183,0.24)] bg-[rgba(6,16,31,0.9)] px-5">
                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Enter your password"
                  className="text-xl h-full w-full bg-transparent text-[var(--base-pure-white)] placeholder:text-[var(--neutral-500)] focus:outline-none"
                />
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--neutral-500)] transition-colors hover:text-[var(--neutral-300)]"
                  aria-label={
                    showPassword ? "Hide password value" : "Show password value"
                  }
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? (
                    <EyeOff className="h-6 w-6" strokeWidth={2.2} />
                  ) : (
                    <Eye className="h-6 w-6" strokeWidth={2.2} />
                  )}
                </button>
              </div>
            </div>

            <div className="grid gap-2">
              <label
                className="text-lg leading-none font-bold"
                htmlFor="confirm-password"
              >
                Confirm Password
              </label>
              <div className="flex h-16 items-center rounded-[18px] border border-[rgba(126,145,183,0.24)] bg-[rgba(6,16,31,0.9)] px-5">
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Enter your confirm password"
                  className="text-xl h-full w-full bg-transparent text-[var(--base-pure-white)] placeholder:text-[var(--neutral-500)] focus:outline-none"
                />
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--neutral-500)] transition-colors hover:text-[var(--neutral-300)]"
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password value"
                      : "Show confirm password value"
                  }
                  onClick={() => setShowConfirmPassword((value) => !value)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-6 w-6" strokeWidth={2.2} />
                  ) : (
                    <Eye className="h-6 w-6" strokeWidth={2.2} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="text-xl flex h-16 items-center justify-center rounded-full bg-[linear-gradient(90deg,var(--primary-200)_0%,var(--primary-300)_100%)] font-bold text-[var(--base-pure-white)] transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99]"
            >
              Submit
            </button>
          </form>

          <p className="text-xl flex items-center justify-center gap-2 leading-none font-bold text-[var(--neutral-700)]">
            <span>Already have an account?</span>
            <Link href="/login" className="text-[var(--primary-200)]">
              Log in
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}
