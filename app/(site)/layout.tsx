import type { ReactNode } from "react";

import { Header } from "@/components/site/header";

export default function SiteLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--base-pure-black)] text-[var(--base-pure-white)]">
      <Header />
      <div className="flex flex-1 flex-col pt-[80px] md:pt-[120px]">
        {children}
      </div>
    </div>
  );
}
