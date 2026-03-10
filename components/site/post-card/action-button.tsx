import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

type ActionButtonProps = {
  label: string;
  count: number;
  icon: ReactNode;
  onClick?: () => void;
};

export function ActionButton({
  label,
  count,
  icon,
  onClick,
}: ActionButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      aria-label={label}
      onClick={onClick}
      className="h-auto gap-1.5 rounded-none p-0 text-[var(--base-pure-white)] hover:bg-transparent hover:text-[var(--base-pure-white)]"
    >
      <span className="flex size-6 items-center justify-center">{icon}</span>
      <span className="text-sm font-semibold md:text-md">{count}</span>
    </Button>
  );
}
