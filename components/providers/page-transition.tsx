"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";

type PageTransitionProps = {
  children: ReactNode;
};

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        // exit={{ opacity: 0, scale: 0.985 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="min-h-screen origin-top"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
