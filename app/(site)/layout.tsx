import { Suspense, type ReactNode } from "react";

import { Header } from "@/components/site/header";

export default function SiteLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--base-pure-black)] text-[var(--base-pure-white)]">
      <Suspense
        fallback={
          <div className="fixed inset-x-0 top-0 z-40 h-16 border-b border-[rgba(126,145,183,0.2)] bg-[var(--base-pure-black)] md:h-20" />
        }
      >
        <Header />
      </Suspense>
      <div className="flex flex-1 flex-col pt-[80px] md:pt-[120px]">
        {children}
      </div>
    </div>
  );
}
