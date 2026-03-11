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

import { HomeBottomNav } from "@/components/site/home-bottom-nav";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { showErrorToast, showSuccessToast } from "@/components/ui/app-toast";
import {
  ApiError,
  useCreatePostMutation,
} from "@/lib/tanstack/post-queries";
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

function getCreatePostErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Terjadi kesalahan saat membuat postingan.";
}

export default function AddPostPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createPostMutation = useCreatePostMutation({
    showToast: false,
    invalidatePosts: true,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [captionError, setCaptionError] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const previewUrl = useMemo(
    () => (selectedFile ? URL.createObjectURL(selectedFile) : null),
    [selectedFile],
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

    if (createPostMutation.isPending) {
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

    if (!selectedFile) {
      return;
    }

    try {
      const response = await createPostMutation.mutateAsync({
        caption: caption.trim(),
        image: selectedFile,
      });

      showSuccessToast(response.message || "Post berhasil dibuat.");
      router.push("/home");
    } catch (error) {
      showErrorToast("Gagal membuat post", {
        description: getCreatePostErrorMessage(error),
      });
    }
  };

  const hasImagePreview = Boolean(previewUrl);

  return (
    <>
      <main className="flex w-full flex-1 justify-center px-4 pt-0 pb-28 md:px-0 md:pb-32">
        <section className="w-full max-w-[452px]">
          <div className="hidden items-center gap-3 md:flex">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Go back"
              onClick={handleBack}
              className="size-8 "
            >
              <IoArrowBackOutline className="size-8" />
            </Button>
            <h1 className="display-xs font-bold">Add Post</h1>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 md:mt-8">
            <div className="w-full">
              <div className="space-y-3">
                <label htmlFor="post-photo" className="text-sm font-bold">
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
                    "rounded-2xl border border-dashed bg-neutral-950 border-neutral-900 p-5 transition-colors",
                    hasImagePreview
                      ? "min-h-[400px] md:min-h-[530px]"
                      : "min-h-[174px]",
                    photoError ? "border-red" : "border-[rgba(126,145,183,0.24)]",
                    isDraggingOver && !photoError
                      ? "border-[rgba(127,81,249,0.9)]"
                      : "",
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
                        <span className="text-[var(--primary-200)]">
                          Click to upload
                        </span>{" "}
                        <span className="text-[var(--neutral-500)]">
                          or drag and drop
                        </span>
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
                <label htmlFor="caption" className="font-bold text-sm">
                  Caption
                </label>

                <Textarea
                  id="caption"
                  value={caption}
                  onChange={handleCaptionChange}
                  rows={4}
                  placeholder="Create your caption"
                  className={cn(
                    "min-h-25.25 rounded-2xl border-neutral-900 bg-neutral-950 px-4 py-4 text-md shadow-none placeholder:text-neutral-600 focus-visible:ring-0 placeholder:text-md  ",
                    captionError
                      ? "border-red focus-visible:border-red"
                      : "focus-visible:border-[rgba(127,81,249,0.88)]",
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
                disabled={createPostMutation.isPending}
                className="mt-5 h-10 md:h-12 w-full rounded-full bg-primary-300 text-sm md:text-md font-bold md:mt-6"
              >
                {createPostMutation.isPending ? "Sharing..." : "Share"}
              </Button>
            </div>
          </form>
        </section>
      </main>
      <HomeBottomNav />
    </>
  );
}
