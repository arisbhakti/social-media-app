"use client";

import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--base-pure-black)] text-[var(--base-pure-white)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,var(--base-pure-black)_0%,var(--base-pure-black)_64%,rgba(0,0,0,0.98)_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-52vh] left-1/2 h-[110vh] w-[234vw] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(98%_90%_at_50%_8%,rgba(5,3,14,0.98)_0%,rgba(14,6,36,0.96)_24%,rgba(31,13,74,0.92)_44%,rgba(50,23,112,0.88)_58%,rgba(73,36,157,0.86)_70%,rgba(95,49,214,0.84)_82%,rgba(118,72,246,0.82)_92%,rgba(127,81,249,0.8)_100%)] blur-[34px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-34vh] left-1/2 h-[90vh] w-[204vw] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(72%_58%_at_50%_100%,rgba(127,81,249,0.8)_0%,rgba(127,81,249,0.6)_34%,rgba(127,81,249,0.36)_58%,rgba(127,81,249,0.16)_78%,rgba(127,81,249,0)_100%)] blur-[56px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[20vh] left-1/2 h-[58vh] w-[164vw] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(76%_76%_at_50%_46%,rgba(0,0,0,0.99)_0%,rgba(0,0,0,0.92)_34%,rgba(0,0,0,0.3)_68%,rgba(0,0,0,0)_100%)] blur-[28px]"
      />

      <main className="relative z-10 grid min-h-screen place-items-center px-6 py-8">
        <section className="grid w-full max-w-[700px] gap-10 rounded-[30px] border border-[rgba(246,249,254,0.16)] bg-[rgba(3,6,12,0.82)] px-8 py-10 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset] backdrop-blur-[2px] md:w-[456px] md:max-w-none md:rounded-[22px] md:px-6 md:py-7">
          <header className="grid gap-8">
            <div className="flex items-center gap-3">
              <Image
                src="/icon-sociality.svg"
                alt="Sociality icon"
                width={34}
                height={34}
                priority
              />
              <span className="display-md leading-none font-bold">
                Sociality
              </span>
            </div>
            <h1 className="display-lg leading-none font-bold">Welcome Back!</h1>
          </header>

          <form className="grid gap-6">
            <div className="grid gap-2">
              <label className="text-lg leading-none font-bold" htmlFor="email">
                Email
              </label>
              <div className="flex h-16 items-center rounded-[18px] border border-[rgba(126,145,183,0.24)] bg-[rgba(6,16,31,0.9)] px-5">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  className="text-xl h-full w-full bg-transparent text-[var(--base-pure-white)] placeholder:text-[var(--neutral-500)] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <label
                className="text-lg leading-none font-bold"
                htmlFor="password"
              >
                Password
              </label>
              <div className="flex h-16 items-center rounded-[18px] border border-[rgba(126,145,183,0.24)] bg-[rgba(6,16,31,0.9)] px-5">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
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

            <button
              type="submit"
              className="text-xl flex h-16 items-center justify-center rounded-full bg-[linear-gradient(90deg,var(--primary-200)_0%,var(--primary-300)_100%)] font-bold text-[var(--base-pure-white)] transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99]"
            >
              Login
            </button>
          </form>

          <p className="text-xl flex items-center justify-center gap-2 leading-none font-bold text-[var(--neutral-700)]">
            <span>Don&apos;t have an account?</span>
            <Link href="/register" className="text-[var(--primary-200)]">
              Register
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}
