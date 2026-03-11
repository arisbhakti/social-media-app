import type { ReactNode } from "react";

type ModalActionStatProps = {
  label: string;
  count: number;
  icon: ReactNode;
  onClick?: () => void;
};

export function ModalActionStat({ label, count, icon, onClick }: ModalActionStatProps) {
  if (onClick) {
    return (
      <button
        type="button"
        aria-label={label}
        onClick={onClick}
        className="flex items-center gap-2 border-0 bg-transparent p-0 text-inherit"
      >
        <span className="flex size-5 items-center justify-center">{icon}</span>
        <span className="text-md font-semibold">{count}</span>
      </button>
    );
  }

  return (
    <div aria-label={label} className="flex items-center gap-2">
      <span className="flex size-5 items-center justify-center">{icon}</span>
      <span className="text-md font-semibold">{count}</span>
    </div>
  );
}
