import type { ReactNode } from "react";

type ModalActionStatProps = {
  label: string;
  count: number;
  icon: ReactNode;
};

export function ModalActionStat({ label, count, icon }: ModalActionStatProps) {
  return (
    <div aria-label={label} className="flex items-center gap-2">
      <span className="flex size-5 items-center justify-center">{icon}</span>
      <span className="text-md font-semibold">{count}</span>
    </div>
  );
}
