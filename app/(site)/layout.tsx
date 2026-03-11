import { Suspense, type ReactNode } from "react";

import { PageTransition } from "@/components/providers/page-transition";
import { Header } from "@/components/site/header";
import { SiteBottomNav } from "@/components/site/site-bottom-nav";

export default function SiteLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-base-pure-black text-base-pure-white">
      <Suspense
        fallback={
          <div className="fixed inset-x-0 top-0 z-40 h-16 border-b border-[rgba(126,145,183,0.2)] bg-base-pure-black md:h-20" />
        }
      >
        <Header />
      </Suspense>
      <div className="flex flex-1 flex-col pt-20 md:pt-30">
        <PageTransition>{children}</PageTransition>
      </div>
      <SiteBottomNav />
    </div>
  );
}
