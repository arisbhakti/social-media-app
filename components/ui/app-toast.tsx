"use client";

import { CircleCheck, LoaderCircle, OctagonX, X } from "lucide-react";
import { Toaster, toast } from "sonner";
import { cn } from "@/lib/utils";

type AppToastVariant = "success" | "error" | "loading";

type AppToastOptions = {
  description?: string;
  duration?: number;
};

type AppToastContentProps = {
  variant: AppToastVariant;
  title: string;
  description?: string;
  onClose: () => void;
};

const toastVariantClassMap: Record<AppToastVariant, string> = {
  success: "bg-[var(--green)]",
  error: "bg-[var(--red)]",
  loading: "bg-[var(--primary-300)]",
};

function AppToastContent({
  variant,
  title,
  description,
  onClose,
}: AppToastContentProps) {
  const icon =
    variant === "success" ? (
      <CircleCheck className="size-5 text-[var(--base-pure-white)]" />
    ) : variant === "error" ? (
      <OctagonX className="size-5 text-[var(--base-pure-white)]" />
    ) : (
      <LoaderCircle className="size-5 animate-spin text-[var(--base-pure-white)]" />
    );

  return (
    <div
      className={cn(
        "pointer-events-auto flex w-[min(calc(100vw-2rem),360px)] items-start gap-3 rounded-xl px-4 py-3 text-[var(--base-pure-white)] shadow-[0_12px_30px_rgba(0,0,0,0.35)]",
        "animate-in fade-in zoom-in-95 slide-in-from-right-6 duration-200",
        toastVariantClassMap[variant]
      )}
    >
      <div className="mt-1 shrink-0">{icon}</div>
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

export function showAppToast(
  variant: AppToastVariant,
  title: string,
  options: AppToastOptions = {}
) {
  return toast.custom(
    (toastId) => (
      <AppToastContent
        variant={variant}
        title={title}
        description={options.description}
        onClose={() => toast.dismiss(toastId)}
      />
    ),
    {
      duration: options.duration ?? (variant === "loading" ? Infinity : 3000),
    }
  );
}

export function showSuccessToast(
  title: string,
  options: AppToastOptions = {}
) {
  return showAppToast("success", title, options);
}

export function showErrorToast(title: string, options: AppToastOptions = {}) {
  return showAppToast("error", title, options);
}

export function showLoadingToast(title: string, options: AppToastOptions = {}) {
  return showAppToast("loading", title, options);
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
