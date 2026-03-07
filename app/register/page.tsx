"use client";

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
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

      <main className="relative z-10 grid min-h-screen place-items-center px-6 py-8 ">
        <Card className="grid w-full gap-4 md:gap-6 rounded-3xl border border-neutral-900 box-border bg-black/20 px-4 py-8 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset] backdrop-blur-[2px] md:w-111.5  md:px-6 md:py-10">
          <header className="grid gap-4 md:gap-6">
            <div className="flex items-center gap-3 justify-center">
              <Image
                src="/icon-sociality.svg"
                alt="Sociality icon"
                width={30}
                height={30}
                priority
              />
              <span className="display-xs leading-none font-bold">Sociality</span>
            </div>
            <h1 className="text-xl md:display-xs font-bold text-center">Register</h1>
          </header>

          <form className="grid gap-5">
            <div className="grid gap-0.5">
              <Label className="text-sm font-bold" htmlFor="name">
                Name
              </Label>
              <div className="flex h-12 items-center rounded-[18px] border border-neutral-900 box-border bg-neutral-950 px-5">
                <Input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Enter your email"
                  className="text-md h-full w-full border-0 bg-transparent p-0 text-base-pure-white shadow-none placeholder:text-neutral-600 placeholder:font-semibold focus-visible:border-transparent focus-visible:ring-0"
                />
              </div>
            </div>

            <div className="grid gap-0.5">
              <Label className="text-sm font-bold" htmlFor="username">
                Username
              </Label>
              <div className="flex h-12 items-center rounded-[18px] border border-neutral-900 box-border bg-neutral-950 px-5">
                <Input
                  id="username"
                  type="text"
                  autoComplete="username"
                  placeholder="Enter your username"
                  className="text-md h-full w-full border-0 bg-transparent p-0 text-base-pure-white shadow-none placeholder:text-neutral-600 placeholder:font-semibold focus-visible:border-transparent focus-visible:ring-0"
                />
              </div>
            </div>

            <div className="grid gap-0.5">
              <Label className="text-sm font-bold" htmlFor="number-phone">
                Number Phone
              </Label>
              <div className="flex h-12 items-center rounded-[18px] border border-neutral-900 box-border bg-neutral-950 px-5">
                <Input
                  id="number-phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="Enter your number phone"
                  className="text-md h-full w-full border-0 bg-transparent p-0 text-base-pure-white shadow-none placeholder:text-neutral-600 placeholder:font-semibold focus-visible:border-transparent focus-visible:ring-0"
                />
              </div>
            </div>

            <div className="grid gap-0.5">
              <Label className="text-sm font-bold" htmlFor="register-password">
                Password
              </Label>
              <InputGroup className="flex h-12 items-center rounded-[18px] border border-neutral-900 box-border bg-neutral-950 px-5">
                <InputGroupInput
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Enter your password"
                  className="text-md h-full w-full p-0 text-white placeholder:text-neutral-600 placeholder:font-semibold focus-visible:border-transparent focus-visible:ring-0"
                />
                <InputGroupAddon align="inline-end" className="pr-0">
                  <InputGroupButton
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-transparent hover:text-neutral-300"
                    aria-label={
                      showPassword
                        ? "Hide password value"
                        : "Show password value"
                    }
                    onClick={() => setShowPassword((value) => !value)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-6 w-6" strokeWidth={2.2} />
                    ) : (
                      <Eye className="h-6 w-6" strokeWidth={2.2} />
                    )}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </div>

            <div className="grid gap-0.5">
              <Label className="text-sm font-bold" htmlFor="confirm-password">
                Confirm Password
              </Label>
              <InputGroup className="flex h-12 items-center rounded-[18px] border border-neutral-900 box-border bg-neutral-950 px-5">
                <InputGroupInput
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Enter your confirm password"
                  className="text-md h-full w-full p-0 text-white placeholder:text-neutral-600 placeholder:font-semibold focus-visible:border-transparent focus-visible:ring-0"
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
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-6 w-6" strokeWidth={2.2} />
                    ) : (
                      <Eye className="h-6 w-6" strokeWidth={2.2} />
                    )}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </div>

            <Button
              type="submit"
              variant="ghost"
              className="text-md flex h-11 md:h-12 items-center justify-center rounded-full bg-primary-300 font-bold text-base-pure-white hover:bg-primary-200 hover:text-base-pure-white transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99]"
            >
              Submit
            </Button>
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
