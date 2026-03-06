"use client";

import { X } from "lucide-react";
import { Toaster, toast } from "sonner";

type AppSuccessToastOptions = {
  description?: string;
  duration?: number;
};

type SuccessToastContentProps = {
  title: string;
  description?: string;
  onClose: () => void;
};

function SuccessToastContent({
  title,
  description,
  onClose,
}: SuccessToastContentProps) {
  return (
    <div className="pointer-events-auto flex w-[min(calc(100vw-2rem),360px)] items-start gap-3 rounded-xl bg-[var(--green)] px-4 py-3 text-[var(--base-pure-white)] shadow-[0_12px_30px_rgba(0,0,0,0.35)]">
      <div className="min-w-0 flex-1">
        <p className="text-[20px] leading-[28px] font-medium">{title}</p>
        {description ? (
          <p className="mt-1 text-[14px] leading-[20px] text-[rgba(255,255,255,0.92)]">
            {description}
          </p>
        ) : null}
      </div>

      <button
        type="button"
        aria-label="Close notification"
        onClick={onClose}
        className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full text-[rgba(255,255,255,0.95)] transition-colors hover:bg-[rgba(255,255,255,0.15)]"
      >
        <X className="size-[18px]" />
      </button>
    </div>
  );
}

export function showSuccessToast(
  title: string,
  options: AppSuccessToastOptions = {}
) {
  return toast.custom(
    (toastId) => (
      <SuccessToastContent
        title={title}
        description={options.description}
        onClose={() => toast.dismiss(toastId)}
      />
    ),
    {
      duration: options.duration ?? 3000,
    }
  );
}

export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      offset={84}
      toastOptions={{
        classNames: {
          toast:
            "!border-0 !bg-transparent !shadow-none !p-0 !rounded-none !w-auto",
          content: "!p-0",
        },
      }}
    />
  );
}
