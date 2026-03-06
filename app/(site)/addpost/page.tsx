"use client";

import {
  ChangeEvent,
  DragEvent,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  IoArrowBackOutline,
  IoCloudUploadOutline,
  IoTrashOutline,
} from "react-icons/io5";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { showSuccessToast } from "@/components/ui/app-toast";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE_IN_BYTES = 5 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = ["image/png", "image/jpeg"];

function validateImage(file: File | null) {
  if (!file) {
    return "Photo is required.";
  }

  if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
    return "Photo must be PNG or JPG.";
  }

  if (file.size > MAX_FILE_SIZE_IN_BYTES) {
    return "Photo max size is 5MB.";
  }

  return null;
}

export default function AddPostPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [captionError, setCaptionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const previewUrl = useMemo(
    () => (selectedFile ? URL.createObjectURL(selectedFile) : null),
    [selectedFile]
  );

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/home");
  };

  const handleImageSelection = (incomingFile: File | null) => {
    const imageError = validateImage(incomingFile);

    if (imageError) {
      setPhotoError(imageError);

      if (!selectedFile) {
        setSelectedFile(null);
      }

      return;
    }

    setSelectedFile(incomingFile);
    setPhotoError(null);
  };

  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    handleImageSelection(file);

    // Allows selecting the same file again after delete/change.
    event.target.value = "";
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingOver(false);

    const droppedFile = event.dataTransfer.files?.[0] ?? null;
    handleImageSelection(droppedFile);
  };

  const handleDeleteImage = () => {
    setSelectedFile(null);
    setPhotoError(null);
  };

  const handleCaptionChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setCaption(event.target.value);

    if (captionError && event.target.value.trim()) {
      setCaptionError(null);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const imageError = validateImage(selectedFile);
    const nextCaptionError = caption.trim()
      ? null
      : "Caption must not be empty.";

    setPhotoError(imageError);
    setCaptionError(nextCaptionError);

    if (imageError || nextCaptionError) {
      return;
    }

    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 450));

    showSuccessToast("Post Success Upload");
    router.push("/home");
  };

  const hasImagePreview = Boolean(previewUrl);

  return (
    <main className="flex w-full flex-1 justify-center px-4 pt-6 pb-8 md:px-0 md:pt-10 md:pb-16">
      <section className="w-full max-w-[812px]">
        <div className="hidden items-center gap-3 md:flex">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Go back"
            onClick={handleBack}
            className="size-[40px] rounded-full border border-[rgba(126,145,183,0.2)] text-[var(--base-pure-white)] hover:bg-[rgba(126,145,183,0.16)]"
          >
            <IoArrowBackOutline className="size-[22px]" />
          </Button>
          <h1 className="text-[44px] leading-[52px] font-bold text-[var(--base-pure-white)]">
            Add Post
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 md:mt-8">
          <div className="w-full md:max-w-[640px]">
            <div className="space-y-3">
              <label
                htmlFor="post-photo"
                className="block text-[18px] leading-[28px] font-bold text-[var(--base-pure-white)] md:text-[16px] md:leading-[24px]"
              >
                Photo
              </label>

              <input
                ref={fileInputRef}
                id="post-photo"
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={handleFileInputChange}
              />

              <div
                role="button"
                tabIndex={0}
                onClick={openFilePicker}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openFilePicker();
                  }
                }}
                className={cn(
                  "rounded-[16px] border border-dashed bg-[rgba(6,16,31,0.72)] p-5 transition-colors",
                  hasImagePreview
                    ? "min-h-[400px] md:min-h-[530px]"
                    : "min-h-[174px]",
                  photoError
                    ? "border-[var(--red)]"
                    : "border-[rgba(126,145,183,0.24)]",
                  isDraggingOver && !photoError
                    ? "border-[rgba(127,81,249,0.9)]"
                    : ""
                )}
                aria-label="Upload post photo"
              >
                {hasImagePreview ? (
                  <div className="flex h-full flex-col gap-4">
                    <div className="overflow-hidden rounded-[6px] border border-[rgba(126,145,183,0.14)]">
                      <Image
                        src={previewUrl ?? ""}
                        alt="Preview selected post"
                        width={1200}
                        height={1200}
                        unoptimized
                        className="aspect-square w-full object-cover"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={(event) => {
                          event.stopPropagation();
                          openFilePicker();
                        }}
                        className="h-[40px] rounded-[12px] bg-[rgba(20,31,52,0.88)] px-4 text-[16px] leading-[24px] font-medium text-[var(--base-pure-white)] hover:bg-[rgba(30,43,68,0.96)] hover:text-[var(--base-pure-white)]"
                      >
                        <IoCloudUploadOutline className="size-5" />
                        Change Image
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleDeleteImage();
                        }}
                        className="h-[40px] rounded-[12px] bg-[rgba(20,31,52,0.88)] px-4 text-[16px] leading-[24px] font-medium text-[var(--red)] hover:bg-[rgba(30,43,68,0.96)] hover:text-[var(--red)]"
                      >
                        <IoTrashOutline className="size-5" />
                        Delete Image
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full min-h-[132px] flex-col items-center justify-center gap-3 text-center">
                    <span className="inline-flex size-[40px] items-center justify-center rounded-[10px] border border-[rgba(126,145,183,0.24)] bg-[rgba(8,22,42,0.88)]">
                      <IoCloudUploadOutline className="size-5 text-[var(--base-pure-white)]" />
                    </span>

                    <p className="text-[16px] leading-[24px] font-medium">
                      <span className="text-[var(--primary-200)]">Click to upload</span>{" "}
                      <span className="text-[var(--neutral-500)]">or drag and drop</span>
                    </p>

                    <p className="text-[16px] leading-[24px] font-semibold text-[var(--neutral-500)]">
                      PNG or JPG (max. 5mb)
                    </p>
                  </div>
                )}
              </div>

              {photoError ? (
                <p className="text-[14px] leading-[20px] font-medium text-[var(--red)]">
                  {photoError}
                </p>
              ) : null}
            </div>

            <div className="mt-5 space-y-2 md:mt-6">
              <label
                htmlFor="caption"
                className="block text-[18px] leading-[28px] font-bold text-[var(--base-pure-white)] md:text-[16px] md:leading-[24px]"
              >
                Caption
              </label>

              <Textarea
                id="caption"
                value={caption}
                onChange={handleCaptionChange}
                rows={4}
                placeholder="Create your caption"
                className={cn(
                  "min-h-[150px] rounded-[16px] border-[rgba(126,145,183,0.2)] bg-[rgba(6,16,31,0.72)] px-4 py-4 text-[16px] leading-[28px] text-[var(--base-pure-white)] shadow-none placeholder:text-[rgba(164,167,174,0.55)] focus-visible:ring-0 md:min-h-[132px] md:leading-[32px]",
                  captionError
                    ? "border-[var(--red)] focus-visible:border-[var(--red)]"
                    : "focus-visible:border-[rgba(127,81,249,0.88)]"
                )}
              />

              {captionError ? (
                <p className="text-[14px] leading-[20px] font-medium text-[var(--red)]">
                  {captionError}
                </p>
              ) : null}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="mt-5 h-[58px] w-full rounded-full bg-[linear-gradient(90deg,#7f51f9_0%,#6936f2_100%)] text-[16px] leading-[24px] font-semibold text-[var(--base-pure-white)] hover:bg-[linear-gradient(90deg,#7f51f9_0%,#6936f2_100%)] md:mt-6 md:h-[56px]"
            >
              {isSubmitting ? "Sharing..." : "Share"}
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}
