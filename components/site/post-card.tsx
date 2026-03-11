"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { EmojiStyle, Theme, type EmojiClickData } from "emoji-picker-react";

import {
  IoBookmark,
  IoBookmarkOutline,
  IoClose,
  IoHappyOutline,
  IoHeart,
  IoHeartOutline,
  IoTrashOutline,
} from "react-icons/io5";

import { useIsMobile } from "@/hooks/use-mobile";
import { ActionButton } from "@/components/site/post-card/action-button";
import { CommentRow } from "@/components/site/post-card/comment-row";
import { LikesList } from "@/components/site/post-card/likes-list";
import { ModalActionStat } from "@/components/site/post-card/modal-action-stat";
import type {
  CommentItem,
  PostCardProps,
} from "@/components/site/post-card/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { showErrorToast, showSuccessToast } from "@/components/ui/app-toast";
import { useAppSelector } from "@/lib/redux/hooks";
import {
  ApiError,
  type PostCommentItem,
  useCreatePostCommentMutation,
  useDeletePostCommentMutation,
  useDeletePostMutation,
  usePostCommentsQuery,
  usePostDetailQuery,
  useTogglePostLikeMutation,
  useTogglePostSaveMutation,
} from "@/lib/tanstack/post-queries";
import { cn } from "@/lib/utils";

const EmojiPicker = dynamic(
  () => import("emoji-picker-react").then((mod) => mod.default),
  { ssr: false },
);

function formatRelativeTime(isoDate: string) {
  const targetDate = new Date(isoDate);
  if (Number.isNaN(targetDate.getTime())) {
    return "Just now";
  }

  const secondsDiff = Math.round(
    (targetDate.getTime() - Date.now()) / 1000,
  );
  const absoluteSeconds = Math.abs(secondsDiff);
  const formatter = new Intl.RelativeTimeFormat("en", {
    numeric: "auto",
  });

  if (absoluteSeconds < 60) {
    return formatter.format(secondsDiff, "second");
  }

  const minutesDiff = Math.round(secondsDiff / 60);
  if (Math.abs(minutesDiff) < 60) {
    return formatter.format(minutesDiff, "minute");
  }

  const hoursDiff = Math.round(minutesDiff / 60);
  if (Math.abs(hoursDiff) < 24) {
    return formatter.format(hoursDiff, "hour");
  }

  const daysDiff = Math.round(hoursDiff / 24);
  if (Math.abs(daysDiff) < 30) {
    return formatter.format(daysDiff, "day");
  }

  const monthsDiff = Math.round(daysDiff / 30);
  if (Math.abs(monthsDiff) < 12) {
    return formatter.format(monthsDiff, "month");
  }

  const yearsDiff = Math.round(monthsDiff / 12);
  return formatter.format(yearsDiff, "year");
}

function CommentsListSkeleton() {
  return (
    <div className="grid gap-4 pr-1">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={`comment-list-skeleton-${index}`}
          className="grid gap-2 border-b border-neutral-900 pb-3 last:border-b-0 last:pb-0 md:gap-2.5 md:pb-4"
        >
          <div className="flex items-center gap-2">
            <Skeleton className="size-10 rounded-full" />
            <div className="grid gap-1.5">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-4 w-full" />
        </div>
      ))}
    </div>
  );
}

function ComposerSkeleton() {
  return (
    <div className="flex items-center gap-2">
      <Skeleton className="size-12 rounded-[14px]" />
      <Skeleton className="h-12 flex-1 rounded-[14px]" />
    </div>
  );
}

function ModalActionStatsSkeleton() {
  return (
    <div className="flex items-center justify-between border-y border-y-[rgba(126,145,183,0.2)] py-3">
      <div className="flex items-center gap-4">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-24" />
      </div>
      <Skeleton className="size-6 rounded-sm" />
    </div>
  );
}

function normalizeString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function mapCommentItem(comment: PostCommentItem): CommentItem {
  const normalizedAuthorName = normalizeString(comment.author?.name).trim();
  const normalizedAuthorUsername = normalizeString(comment.author?.username).trim();
  const authorName = normalizedAuthorName || normalizedAuthorUsername || "Unknown";

  return {
    id: comment.id,
    authorId: comment.author?.id ?? 0,
    name: authorName,
    username: normalizedAuthorUsername,
    avatarUrl: comment.author?.avatarUrl ?? null,
    content: normalizeString(comment.text),
    createdAt: formatRelativeTime(comment.createdAt),
    isMine: Boolean(comment.isMine),
  };
}

export function PostCard({
  postId,
  imageSrc,
  imageAlt = "Post image",
  liked = false,
  saved = false,
  authorName = "Johndoe",
  authorUsername = "",
  authorAvatarUrl,
  caption = "",
  createdAtLabel = "Just now",
  likeCount = 0,
  commentCount = 0,
  thumbnailOnly = false,
  thumbnailClassName,
}: PostCardProps) {
  const [isLikesOpen, setIsLikesOpen] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isDeleteCommentAlertOpen, setIsDeleteCommentAlertOpen] =
    useState(false);
  const [selectedComment, setSelectedComment] = useState<CommentItem | null>(
    null
  );
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);
  const viewerUserId = useAppSelector((state) => state.auth.user?.id ?? null);
  const [commentInput, setCommentInput] = useState("");
  const emojiPickerRef = useRef<HTMLDivElement | null>(null);
  const emojiButtonRef = useRef<HTMLButtonElement | null>(null);
  const router = useRouter();
  const isMobile = useIsMobile();
  const postDetailQuery = usePostDetailQuery(postId, isCommentsOpen);
  const modalPostDetail = postDetailQuery.data?.data;
  const commentsQuery = usePostCommentsQuery(postId, 1, 10, isCommentsOpen);
  const createPostCommentMutation = useCreatePostCommentMutation();
  const comments = useMemo<CommentItem[]>(
    () => commentsQuery.data?.data.comments.map(mapCommentItem) ?? [],
    [commentsQuery.data],
  );
  const safeAuthorName = normalizeString(authorName);
  const safeAuthorUsername = normalizeString(authorUsername);
  const safeCaption = normalizeString(caption);
  const safeCreatedAtLabel = normalizeString(createdAtLabel) || "Just now";
  const safePostAuthorName = safeAuthorName.trim() || "Unknown";
  const safePostAuthorUsername = safeAuthorUsername.trim();
  const modalAuthorName =
    normalizeString(modalPostDetail?.author.name).trim() ||
    normalizeString(modalPostDetail?.author.username).trim() ||
    safePostAuthorName;
  const modalAuthorUsername =
    normalizeString(modalPostDetail?.author.username).trim() ||
    safePostAuthorUsername;
  const modalAuthorAvatarUrl = modalPostDetail?.author.avatarUrl ?? authorAvatarUrl;
  const modalCaption = modalPostDetail
    ? normalizeString(modalPostDetail.caption)
    : safeCaption;
  const modalCaptionText = modalCaption.trim() || "-";
  const modalCreatedAtLabel = modalPostDetail
    ? formatRelativeTime(modalPostDetail.createdAt)
    : safeCreatedAtLabel;
  const modalLikeCount = modalPostDetail?.likeCount ?? likeCount;
  const modalCommentCount = modalPostDetail?.commentCount ?? commentCount;
  const modalLiked = modalPostDetail?.likedByMe ?? liked;
  const modalSaved = modalPostDetail?.savedByMe ?? saved;
  const modalImageSrc = modalPostDetail?.imageUrl ?? imageSrc;
  const cardAvatarFallback = safePostAuthorName.charAt(0).toUpperCase() || "U";
  const modalAvatarFallback = modalAuthorName.charAt(0).toUpperCase() || "U";
  const isPostDetailLoading =
    postDetailQuery.isLoading || (postDetailQuery.isFetching && !modalPostDetail);
  const hasPostDetailError = Boolean(postDetailQuery.error) && !modalPostDetail;
  const isCreateCommentPending =
    createPostCommentMutation.isPending &&
    createPostCommentMutation.variables?.postId === postId;
  const isPostDisabled = commentInput.trim().length === 0 || isCreateCommentPending;
  const normalizedCaption = safeCaption.trim() || "-";
  const hasLongCaption = normalizedCaption.length > 140;
  const visibleCaption =
    hasLongCaption && !isCaptionExpanded
      ? `${normalizedCaption.slice(0, 140)}...`
      : normalizedCaption;
  const togglePostLikeMutation = useTogglePostLikeMutation();
  const togglePostSaveMutation = useTogglePostSaveMutation();
  const deletePostMutation = useDeletePostMutation({
    showToast: true,
  });
  const deletePostCommentMutation = useDeletePostCommentMutation({
    showToast: true,
  });
  const isLikePending =
    togglePostLikeMutation.isPending &&
    togglePostLikeMutation.variables?.postId === postId;
  const isSavePending =
    togglePostSaveMutation.isPending &&
    togglePostSaveMutation.variables?.postId === postId;
  const isDeletePending =
    deletePostMutation.isPending &&
    deletePostMutation.variables?.postId === postId;
  const isDeleteCommentPending =
    deletePostCommentMutation.isPending &&
    deletePostCommentMutation.variables?.postId === postId;
  const canDeletePost = Boolean(
    modalPostDetail &&
      viewerUserId !== null &&
      modalPostDetail.author.id === viewerUserId
  );
  const canDeleteAllComments = canDeletePost;
  const commentsTotalCount =
    commentsQuery.data?.data.pagination.total ?? modalCommentCount;
  const commentsErrorMessage =
    commentsQuery.error instanceof ApiError
      ? commentsQuery.error.message
      : commentsQuery.error instanceof Error
        ? commentsQuery.error.message
        : "Gagal memuat komentar";
  const postDetailErrorMessage =
    postDetailQuery.error instanceof ApiError
      ? postDetailQuery.error.message
      : postDetailQuery.error instanceof Error
        ? postDetailQuery.error.message
        : "Gagal memuat detail post";

  const handleOpenComments = () => {
    setIsCommentsOpen(true);
  };

  const handleOpenAuthorProfile = (username: string) => {
    const normalizedUsername = username.trim();
    if (!normalizedUsername) {
      return;
    }

    router.push(`/profile/${encodeURIComponent(normalizedUsername)}`);
  };

  const handleToggleLike = (currentLiked: boolean) => {
    if (isLikePending) {
      return;
    }

    togglePostLikeMutation.mutate({
      postId,
      liked: currentLiked,
    });
  };

  const handleToggleSave = (currentSaved: boolean) => {
    if (isSavePending) {
      return;
    }

    togglePostSaveMutation.mutate({
      postId,
      saved: currentSaved,
    });
  };

  const handleSharePost = async () => {
    if (typeof window === "undefined") {
      return;
    }

    const shareUrl = new URL(window.location.href);
    shareUrl.searchParams.set("postId", String(postId));
    const normalizedUsername = safePostAuthorUsername;
    const normalizedAuthorName = safePostAuthorName;
    const shareText = normalizedUsername
      ? `Lihat post @${normalizedUsername} di Sociality`
      : normalizedAuthorName
        ? `Lihat post ${normalizedAuthorName} di Sociality`
        : "Lihat post di Sociality";

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Sociality Post",
          text: shareText,
          url: shareUrl.toString(),
        });
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl.toString());
        showSuccessToast("Link post berhasil disalin");
        return;
      }

      showErrorToast("Browser tidak mendukung fitur share");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      showErrorToast("Gagal membagikan post");
    }
  };

  const handleCommentsOpenChange = (open: boolean) => {
    setIsCommentsOpen(open);

    if (!open) {
      setIsEmojiPickerOpen(false);
      setIsDeleteAlertOpen(false);
      setIsDeleteCommentAlertOpen(false);
      setSelectedComment(null);
    }
  };

  const handleSubmitComment = () => {
    const trimmedComment = commentInput.trim();

    if (!trimmedComment || isCreateCommentPending) {
      return;
    }

    createPostCommentMutation.mutate(
      {
        postId,
        text: trimmedComment,
      },
      {
        onSuccess: () => {
          setCommentInput("");
          setIsEmojiPickerOpen(false);
        },
      },
    );
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setCommentInput((prevValue) => `${prevValue}${emojiData.emoji}`);
  };

  const handleDeletePostRequest = () => {
    if (!canDeletePost || isDeletePending) {
      return;
    }

    setIsDeleteAlertOpen(true);
  };

  const handleDeletePost = () => {
    if (!canDeletePost || isDeletePending) {
      return;
    }

    deletePostMutation.mutate(
      { postId },
      {
        onSuccess: () => {
          setIsDeleteAlertOpen(false);
          handleCommentsOpenChange(false);
          setIsLikesOpen(false);
        },
      }
    );
  };

  const canDeleteComment = (comment: CommentItem) => {
    if (canDeleteAllComments) {
      return true;
    }

    if (viewerUserId === null) {
      return false;
    }

    return comment.isMine === true || comment.authorId === viewerUserId;
  };

  const handleDeleteCommentRequest = (comment: CommentItem) => {
    if (!canDeleteComment(comment) || isDeleteCommentPending) {
      return;
    }

    setSelectedComment(comment);
    setIsDeleteCommentAlertOpen(true);
  };

  const handleDeleteComment = () => {
    if (!selectedComment || isDeleteCommentPending) {
      return;
    }

    deletePostCommentMutation.mutate(
      {
        postId,
        commentId: selectedComment.id,
      },
      {
        onSuccess: () => {
          setIsDeleteCommentAlertOpen(false);
          setSelectedComment(null);
        },
      }
    );
  };

  useEffect(() => {
    if (!isEmojiPickerOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!(event.target instanceof Node)) {
        return;
      }

      if (emojiPickerRef.current?.contains(event.target)) {
        return;
      }

      if (emojiButtonRef.current?.contains(event.target)) {
        return;
      }

      setIsEmojiPickerOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isEmojiPickerOpen]);

  const commentsContent = (
    <div className="flex min-h-55 flex-1 flex-col items-center justify-center text-center">
      <h3 className="text-[24px] leading-7 font-bold text-base-pure-white">
        No Comments yet
      </h3>
      <p className="mt-1 text-[14px] leading-5 text-neutral-500">
        Start the conversation
      </p>
    </div>
  );
  const commentsListContent = commentsQuery.isLoading ? (
    <CommentsListSkeleton />
  ) : commentsQuery.error ? (
    <div className="grid gap-3 rounded-[14px] border border-neutral-900 p-4">
      <p className="text-sm text-red">{commentsErrorMessage}</p>
      <Button
        type="button"
        onClick={() => commentsQuery.refetch()}
        className="h-9 w-fit rounded-full bg-primary-300 px-4 text-sm font-bold text-white hover:bg-primary-200"
      >
        Coba lagi
      </Button>
    </div>
  ) : comments.length === 0 ? (
    commentsContent
  ) : (
    <div className="grid gap-4 pr-1">
      {comments.map((comment) => (
        <CommentRow
          key={comment.id}
          item={comment}
          canDelete={canDeleteComment(comment)}
          isDeletePending={
            isDeleteCommentPending &&
            deletePostCommentMutation.variables?.commentId === comment.id
          }
          onDelete={handleDeleteCommentRequest}
        />
      ))}
    </div>
  );
  const postPreviewTrigger = (
    <button
      type="button"
      onClick={handleOpenComments}
      className={cn(
        "group relative w-full overflow-hidden transition-shadow duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(105,54,242,0.42)]",
        thumbnailOnly
          ? `aspect-square rounded-[2.67px] hover:shadow-[0_12px_26px_rgba(105,54,242,0.25)] md:rounded-[6px] ${thumbnailClassName ?? ""}`
          : "rounded-xl hover:shadow-[0_18px_36px_rgba(105,54,242,0.22)]",
      )}
      aria-label={thumbnailOnly ? "Open post detail" : "Open comments"}
    >
      <Image
        src={imageSrc}
        alt={imageAlt}
        width={1000}
        height={1000}
        className={cn(
          "aspect-square w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]",
          thumbnailOnly ? "h-full rounded-[2.67px] md:rounded-[6px]" : "md:h-150",
        )}
      />
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100",
          thumbnailOnly
            ? "bg-[radial-gradient(circle_at_50%_22%,rgba(127,81,249,0.28),rgba(0,0,0,0.4)_68%)] shadow-[inset_0_0_0_1px_rgba(127,81,249,0.65)]"
            : "bg-[linear-gradient(180deg,rgba(127,81,249,0.1)_0%,rgba(0,0,0,0.28)_100%)]",
        )}
      />
    </button>
  );

  return (
    <>
      {thumbnailOnly ? (
        postPreviewTrigger
      ) : (
        <Card className="gap-3 rounded-none border-0 bg-transparent py-0 text-white shadow-none">
          <div className="flex items-center gap-2 md:gap-3">
            <button
              type="button"
              onClick={() => handleOpenAuthorProfile(safePostAuthorUsername)}
              className="flex items-center gap-2 text-left transition-opacity hover:opacity-90 md:gap-3"
            >
              <Avatar className="size-11 border border-[rgba(126,145,183,0.32)] md:size-16">
                <AvatarImage
                  src={authorAvatarUrl ?? "/dummy-profile-image.png"}
                  alt={safePostAuthorName}
                />
                <AvatarFallback>{cardAvatarFallback}</AvatarFallback>
              </Avatar>
              <div className="grid gap-0">
                <span className="text-sm font-bold md:text-md">
                  {safePostAuthorName}
                </span>
                <span className="text-xs text-neutral-400 md:text-sm">
                  {safeCreatedAtLabel}
                </span>
              </div>
            </button>
          </div>

          {postPreviewTrigger}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={liked ? "Unlike post" : "Like post"}
                  onClick={() => handleToggleLike(liked)}
                  disabled={isLikePending}
                  className="size-6 rounded-none p-0 text-base-pure-white hover:bg-transparent hover:text-base-pure-white disabled:opacity-70"
                >
                  {liked ? (
                    <IoHeart className="size-6 text-red" />
                  ) : (
                    <IoHeartOutline className="size-6" />
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  aria-label="Open likes list"
                  onClick={() => setIsLikesOpen(true)}
                  className="h-auto rounded-none p-0 text-sm font-semibold text-base-pure-white hover:bg-transparent hover:text-base-pure-white md:text-md"
                >
                  {modalLikeCount}
                </Button>
              </div>
              <ActionButton
                label="Open comments"
                count={commentsTotalCount}
                onClick={handleOpenComments}
                icon={
                  <Image
                    src="/icon-comment.svg"
                    alt="Comment"
                    width={24}
                    height={24}
                    className="size-6"
                  />
                }
              />
              <ActionButton
                label="Share post"
                count={0}
                onClick={handleSharePost}
                icon={
                  <Image
                    src="/icon-share.svg"
                    alt="Share"
                    width={24}
                    height={24}
                    className="size-6"
                  />
                }
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={saved ? "Unsave post" : "Save post"}
              onClick={() => handleToggleSave(saved)}
              disabled={isSavePending}
              className="size-5 rounded-none p-0 text-base-pure-white hover:bg-transparent"
            >
              {saved ? (
                <IoBookmark className="size-6" />
              ) : (
                <IoBookmarkOutline className="size-6" />
              )}
            </Button>
          </div>

          <div className="grid gap-0 md:gap-1">
            <button
              type="button"
              onClick={() => handleOpenAuthorProfile(safePostAuthorUsername)}
              className="w-fit text-left text-sm font-bold transition-opacity hover:opacity-90 md:text-md"
            >
              {safePostAuthorName}
            </button>
            <p className="text-sm md:text-md text-neutral-25">{visibleCaption}</p>
            {hasLongCaption ? (
              <Button
                type="button"
                variant="link"
                onClick={() => setIsCaptionExpanded((value) => !value)}
                className="h-auto w-fit p-0 text-sm md:text-md font-bold text-primary-200"
              >
                {isCaptionExpanded ? "Show Less" : "Show More"}
              </Button>
            ) : null}
          </div>
        </Card>
      )}

      {isMobile ? (
        <Drawer open={isLikesOpen} onOpenChange={setIsLikesOpen}>
          <DrawerContent className="[&>div:first-child]:hidden max-h-[72vh] border-t border-t-[rgba(126,145,183,0.2)] bg-neutral-950 p-0! ">
            <DrawerTitle className="sr-only">Likes</DrawerTitle>
            <div className="relative px-4 pt-4 pb-4">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Close likes list"
                onClick={() => setIsLikesOpen(false)}
                className="absolute -top-8 right-4 z-20 size-6 rounded-full p-0 text-base-pure-white hover:bg-transparent"
              >
                <IoClose className="size-6" />
              </Button>

              <LikesList postId={postId} />
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={isLikesOpen} onOpenChange={setIsLikesOpen}>
          <DialogContent
            showCloseButton={false}
            className="w-137! border-0 bg-neutral-950 p-0 text-neutral-25 "
          >
            <DialogTitle className="sr-only">Likes</DialogTitle>
            <div className="relative">
              <Button
                type="button"
                variant="ghost"
                aria-label="Close likes list"
                onClick={() => setIsLikesOpen(false)}
                className="absolute -top-10 right-0 z-20 size-6 rounded-full p-0 text-white hover:bg-transparent"
              >
                <IoClose className="size-6" />
              </Button>
              <LikesList postId={postId} />
            </div>
          </DialogContent>
        </Dialog>
      )}

      {isMobile ? (
        <Drawer open={isCommentsOpen} onOpenChange={handleCommentsOpenChange}>
          <DrawerContent className="[&>div:first-child]:hidden max-h-[72vh] border-t border-t-[rgba(126,145,183,0.2)] bg-neutral-950 p-0 text-base-pure-white">
            <DrawerTitle className="sr-only">Comments</DrawerTitle>
            <div className="relative flex min-h-0 flex-1 flex-col px-4 pt-4 pb-4">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Close comments"
                onClick={() => handleCommentsOpenChange(false)}
                className="absolute -top-10 right-4 z-20 size-6 rounded-full p-0 text-base-pure-white hover:bg-transparent"
              >
                <IoClose className="size-6" />
              </Button>

              <h2 className="text-md font-bold text-base-pure-white">
                Comments
              </h2>

              {hasPostDetailError ? (
                <div className="mt-3 grid gap-3 rounded-[14px] border border-neutral-900 p-4">
                  <p className="text-sm text-red">{postDetailErrorMessage}</p>
                  <Button
                    type="button"
                    onClick={() => postDetailQuery.refetch()}
                    className="h-9 w-fit rounded-full bg-primary-300 px-4 text-sm font-bold text-white hover:bg-primary-200"
                  >
                    Coba lagi
                  </Button>
                </div>
              ) : isPostDetailLoading ? (
                <div className="mt-3">
                  <ModalActionStatsSkeleton />
                </div>
              ) : (
                <div className="mt-3 flex items-center justify-between border-y border-y-[rgba(126,145,183,0.2)] py-3">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={modalLiked ? "Unlike post" : "Like post"}
                        onClick={() => handleToggleLike(modalLiked)}
                        disabled={isLikePending}
                        className="size-6 rounded-none p-0 text-base-pure-white hover:bg-transparent disabled:opacity-70"
                      >
                        {modalLiked ? (
                          <IoHeart className="size-6 text-red" />
                        ) : (
                          <IoHeartOutline className="size-6" />
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        aria-label="Open likes list"
                        onClick={() => setIsLikesOpen(true)}
                        className="h-auto rounded-none p-0 text-sm font-semibold text-base-pure-white hover:bg-transparent hover:text-base-pure-white"
                      >
                        {modalLikeCount}
                      </Button>
                    </div>
                    <ModalActionStat
                      label="Total comments"
                      count={commentsTotalCount}
                      icon={
                        <Image
                          src="/icon-comment.svg"
                          alt="Comment"
                          width={20}
                          height={20}
                          className="size-5"
                        />
                      }
                    />
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={modalSaved ? "Unsave post" : "Save post"}
                    onClick={() => handleToggleSave(modalSaved)}
                    disabled={isSavePending}
                    className="size-6 rounded-none p-0 text-base-pure-white hover:bg-transparent disabled:opacity-70"
                  >
                    {modalSaved ? (
                      <IoBookmark className="size-6" />
                    ) : (
                      <IoBookmarkOutline className="size-6" />
                    )}
                  </Button>
                </div>
              )}

              <div className="mt-4 flex min-h-0 flex-1 flex-col overflow-y-auto">
                {hasPostDetailError ? (
                  <div className="grid gap-3 rounded-[14px] border border-neutral-900 p-4">
                    <p className="text-sm text-red">{postDetailErrorMessage}</p>
                    <Button
                      type="button"
                      onClick={() => postDetailQuery.refetch()}
                      className="h-9 w-fit rounded-full bg-primary-300 px-4 text-sm font-bold text-white hover:bg-primary-200"
                    >
                      Coba lagi
                    </Button>
                  </div>
                ) : isPostDetailLoading ? (
                  <CommentsListSkeleton />
                ) : (
                  commentsListContent
                )}
              </div>

              <div className="relative mt-4">
                {isEmojiPickerOpen && !isPostDetailLoading && !hasPostDetailError ? (
                  <div
                    ref={emojiPickerRef}
                    className="absolute bottom-[calc(100%+10px)] left-0 z-30 overflow-hidden rounded-2xl border border-[rgba(126,145,183,0.24)] shadow-[0_16px_34px_rgba(0,0,0,0.5)]"
                  >
                    <EmojiPicker
                      onEmojiClick={handleEmojiClick}
                      emojiStyle={EmojiStyle.NATIVE}
                      theme={Theme.DARK}
                      searchDisabled
                      skinTonesDisabled
                      width={260}
                      height={188}
                      lazyLoadEmojis
                      previewConfig={{ showPreview: false }}
                    />
                  </div>
                ) : null}

                {isPostDetailLoading || hasPostDetailError ? (
                  <ComposerSkeleton />
                ) : (
                  <div className="flex items-center gap-2">
                    <Button
                      ref={emojiButtonRef}
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Add emoji"
                      onClick={() => setIsEmojiPickerOpen((value) => !value)}
                      className="size-12 rounded-[14px] border border-[rgba(126,145,183,0.2)] p-0 text-base-pure-white hover:bg-transparent"
                    >
                      <IoHappyOutline className="size-6" />
                    </Button>

                    <div className="flex h-12 flex-1 items-center rounded-[14px] border border-[rgba(126,145,183,0.2)] bg-transparent px-3 transition-[border-color,box-shadow] duration-200 focus-within:border-primary-200 focus-within:shadow-[0_0_0_3px_rgba(127,81,249,0.28),0_14px_28px_rgba(105,54,242,0.24)]">
                      <input
                        type="text"
                        aria-label="Add comment"
                        placeholder="Add Comment"
                        value={commentInput}
                        onChange={(event) => setCommentInput(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            handleSubmitComment();
                          }
                        }}
                        className="h-full min-w-0 flex-1 border-0 bg-transparent text-md text-base-pure-white outline-none focus-visible:border-transparent focus-visible:ring-0 placeholder:text-neutral-500"
                      />

                      <Button
                        type="button"
                        variant="ghost"
                        onClick={handleSubmitComment}
                        disabled={isPostDisabled}
                        className={cn(
                          "h-auto rounded-none p-0 text-md font-semibold hover:bg-transparent",
                          isPostDisabled
                            ? "text-neutral-500"
                            : "text-primary-200 hover:text-primary-200",
                        )}
                      >
                        {isCreateCommentPending ? "Posting..." : "Post"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={isCommentsOpen} onOpenChange={handleCommentsOpenChange}>
          <DialogContent
            showCloseButton={false}
            className="w-[calc(100vw-48px)] max-w-300! border-0 bg-neutral-950 p-0 text-neutral-25 "
          >
            <DialogTitle className="sr-only">Comments</DialogTitle>
            <div className="relative">
              <Button
                type="button"
                variant="ghost"
                aria-label="Close comments"
                onClick={() => handleCommentsOpenChange(false)}
                className="absolute -top-10 right-0 z-20 size-6 rounded-full p-0 text-white hover:bg-transparent"
              >
                <IoClose className="size-6" />
              </Button>

              <div className="overflow-hidden  bg-black">
                <div className="grid h-[min(84vh,760px)] grid-cols-[minmax(360px,1fr)_minmax(380px,500px)]">
                  <div className="relative h-full bg-red-500">
                    {isPostDetailLoading ? (
                      <Skeleton className="h-full w-full rounded-none" />
                    ) : hasPostDetailError ? (
                      <div className="grid h-full place-items-center px-6 text-center">
                        <div className="grid gap-3">
                          <p className="text-sm text-red">
                            {postDetailErrorMessage}
                          </p>
                          <Button
                            type="button"
                            onClick={() => postDetailQuery.refetch()}
                            className="h-9 rounded-full bg-primary-300 px-4 text-sm font-bold text-white hover:bg-primary-200"
                          >
                            Coba lagi
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Image
                        src={modalImageSrc}
                        alt={imageAlt}
                        fill
                        sizes="(max-width: 1200px) 60vw, 720px"
                        className="object-cover"
                      />
                    )}
                  </div>

                  <div className="flex min-h-0 flex-col bg-neutral-950 p-5 ">
                    <div className="border-b border-b-neutral-900 pb-4 flex flex-col gap-2">
                      {hasPostDetailError ? (
                        <div className="grid gap-3 rounded-[14px] border border-neutral-900 p-4">
                          <p className="text-sm text-red">
                            {postDetailErrorMessage}
                          </p>
                          <Button
                            type="button"
                            onClick={() => postDetailQuery.refetch()}
                            className="h-9 w-fit rounded-full bg-primary-300 px-4 text-sm font-bold text-white hover:bg-primary-200"
                          >
                            Coba lagi
                          </Button>
                        </div>
                      ) : isPostDetailLoading ? (
                        <>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <Skeleton className="size-10 rounded-full" />
                              <div className="grid gap-1.5">
                                <Skeleton className="h-4 w-28" />
                                <Skeleton className="h-3 w-20" />
                              </div>
                            </div>
                            <Skeleton className="size-6 rounded-full" />
                          </div>
                          <Skeleton className="h-4 w-[85%]" />
                          <Skeleton className="h-4 w-[65%]" />
                        </>
                      ) : (
                        <>
                          <div className="flex items-start justify-between gap-3">
                            <button
                              type="button"
                              onClick={() =>
                                handleOpenAuthorProfile(modalAuthorUsername)
                              }
                              className="flex items-center gap-3 text-left transition-opacity hover:opacity-90"
                            >
                              <Avatar className="size-10 ">
                                <AvatarImage
                                  src={modalAuthorAvatarUrl ?? "/dummy-profile-image.png"}
                                  alt={modalAuthorName}
                                />
                                <AvatarFallback>{modalAvatarFallback}</AvatarFallback>
                              </Avatar>
                              <div className="grid gap-0.5">
                                <span className="text-sm font-bold">
                                  {modalAuthorName}
                                </span>
                                <span className="text-xs text-neutral-400">
                                  {modalCreatedAtLabel}
                                </span>
                              </div>
                            </button>

                            {canDeletePost ? (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                aria-label="Delete post"
                                onClick={handleDeletePostRequest}
                                disabled={isDeletePending}
                                className="size-6 rounded-full p-0 hover:bg-transparent disabled:opacity-70"
                              >
                                <IoTrashOutline className="size-6" />
                              </Button>
                            ) : null}
                          </div>

                          <p className="text-sm text-neutral-25">{modalCaptionText}</p>
                        </>
                      )}
                    </div>

                    <div className="mt-5 flex min-h-0 flex-1 flex-col">
                      <h2 className="text-md font-bold text-neutral-25">
                        Comments
                      </h2>

                      <div className="mt-5 flex min-h-0 flex-1 flex-col overflow-y-auto">
                        {hasPostDetailError ? (
                          <div className="grid gap-3 rounded-[14px] border border-neutral-900 p-4">
                            <p className="text-sm text-red">
                              {postDetailErrorMessage}
                            </p>
                            <Button
                              type="button"
                              onClick={() => postDetailQuery.refetch()}
                              className="h-9 w-fit rounded-full bg-primary-300 px-4 text-sm font-bold text-white hover:bg-primary-200"
                            >
                              Coba lagi
                            </Button>
                          </div>
                        ) : isPostDetailLoading ? (
                          <CommentsListSkeleton />
                        ) : (
                          commentsListContent
                        )}
                      </div>
                    </div>

                    <div className="mt-4 border-t border-t-neutral-900 pt-4">
                      {hasPostDetailError ? (
                        <div className="grid gap-3 rounded-[14px] border border-neutral-900 p-4">
                          <p className="text-sm text-red">
                            {postDetailErrorMessage}
                          </p>
                          <Button
                            type="button"
                            onClick={() => postDetailQuery.refetch()}
                            className="h-9 w-fit rounded-full bg-primary-300 px-4 text-sm font-bold text-white hover:bg-primary-200"
                          >
                            Coba lagi
                          </Button>
                        </div>
                      ) : isPostDetailLoading ? (
                        <ModalActionStatsSkeleton />
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                aria-label={modalLiked ? "Unlike post" : "Like post"}
                                onClick={() => handleToggleLike(modalLiked)}
                                disabled={isLikePending}
                                className="size-6 rounded-none p-0 text-white hover:bg-transparent disabled:opacity-70"
                              >
                                {modalLiked ? (
                                  <IoHeart className="size-6 text-red" />
                                ) : (
                                  <IoHeartOutline className="size-6" />
                                )}
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                aria-label="Open likes list"
                                onClick={() => setIsLikesOpen(true)}
                                className="h-auto rounded-none p-0 text-md font-semibold text-white hover:bg-transparent hover:text-white"
                              >
                                {modalLikeCount}
                              </Button>
                            </div>
                            <ModalActionStat
                              label="Total comments"
                              count={commentsTotalCount}
                              icon={
                                <Image
                                  src="/icon-comment.svg"
                                  alt="Comment"
                                  width={24}
                                  height={24}
                                  className="size-6"
                                />
                              }
                            />
                            <ModalActionStat
                              label="Total shares"
                              count={0}
                              onClick={handleSharePost}
                              icon={
                                <Image
                                  src="/icon-share.svg"
                                  alt="Share"
                                  width={24}
                                  height={24}
                                  className="size-6"
                                />
                              }
                            />
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label={modalSaved ? "Unsave post" : "Save post"}
                            onClick={() => handleToggleSave(modalSaved)}
                            disabled={isSavePending}
                            className="size-6 rounded-none p-0 text-white"
                          >
                            {modalSaved ? (
                              <IoBookmark className="size-6" />
                            ) : (
                              <IoBookmarkOutline className="size-6" />
                            )}
                          </Button>
                        </div>
                      )}

                      <div className="relative mt-4">
                        {isEmojiPickerOpen && !isPostDetailLoading && !hasPostDetailError ? (
                          <div
                            ref={emojiPickerRef}
                            className="absolute bottom-[calc(100%+10px)] left-0 z-30 overflow-hidden rounded-2xl border border-[rgba(126,145,183,0.24)] shadow-[0_16px_34px_rgba(0,0,0,0.5)]"
                          >
                            <EmojiPicker
                              onEmojiClick={handleEmojiClick}
                              emojiStyle={EmojiStyle.NATIVE}
                              theme={Theme.DARK}
                              searchDisabled
                              skinTonesDisabled
                              width={260}
                              height={188}
                              lazyLoadEmojis
                              previewConfig={{ showPreview: false }}
                            />
                          </div>
                        ) : null}

                        {isPostDetailLoading || hasPostDetailError ? (
                          <ComposerSkeleton />
                        ) : (
                          <div className="flex items-center gap-2">
                            <Button
                              ref={emojiButtonRef}
                              type="button"
                              variant="ghost"
                              aria-label="Add emoji"
                              onClick={() =>
                                setIsEmojiPickerOpen((value) => !value)
                              }
                              className="size-12 rounded-2xl border border-neutral-900 p-0 text-white "
                            >
                              <IoHappyOutline className="size-6" />
                            </Button>

                            <div className="flex h-12 flex-1 items-center rounded-[14px] border border-neutral-900 bg-neutral-950 px-4 py-2 transition-[border-color,box-shadow] duration-200 focus-within:border-primary-200 focus-within:shadow-[0_0_0_3px_rgba(127,81,249,0.28),0_14px_28px_rgba(105,54,242,0.24)]">
                              <input
                                type="text"
                                aria-label="Add comment"
                                placeholder="Add Comment"
                                value={commentInput}
                                onChange={(event) =>
                                  setCommentInput(event.target.value)
                                }
                                onKeyDown={(event) => {
                                  if (event.key === "Enter") {
                                    event.preventDefault();
                                    handleSubmitComment();
                                  }
                                }}
                                className="h-full min-w-0 flex-1 border-0 bg-transparent text-md text-white outline-none focus-visible:border-transparent focus-visible:ring-0 placeholder:text-neutral-600 font-medium"
                              />

                              <Button
                                type="button"
                                variant="ghost"
                                onClick={handleSubmitComment}
                                disabled={isPostDisabled}
                                className={cn(
                                  "h-auto rounded-none p-0 text-md font-bold hover:bg-transparent",
                                  isPostDisabled
                                    ? "text-neutral-600"
                                    : "text-primary-200 hover:text-primary-300",
                                )}
                              >
                                {isCreateCommentPending ? "Posting..." : "Post"}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog
        open={isDeleteAlertOpen}
        onOpenChange={(open) => {
          if (isDeletePending) {
            return;
          }

          setIsDeleteAlertOpen(open);
        }}
      >
        <AlertDialogContent className="max-w-110 rounded-4xl border border-[rgba(126,145,183,0.24)] bg-neutral-950 p-5 text-base-pure-white shadow-[0_24px_52px_rgba(0,0,0,0.55)] md:p-6">
          <AlertDialogHeader className="text-left">
            <AlertDialogTitle className="text-lg font-bold text-white md:text-xl">
              Hapus post ini?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-neutral-400">
              Post yang sudah dihapus tidak bisa dikembalikan lagi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-2 gap-3">
            <AlertDialogCancel
              disabled={isDeletePending}
              className="mt-0 h-10 rounded-full border border-neutral-700 bg-transparent px-5 text-sm font-bold text-white hover:bg-neutral-900 hover:text-white"
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeletePending}
              onClick={(event) => {
                event.preventDefault();
                handleDeletePost();
              }}
              className="h-10 rounded-full bg-red px-5 text-sm font-bold text-white hover:bg-[#e02c2c]"
            >
              {isDeletePending ? "Menghapus..." : "Ya, Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={isDeleteCommentAlertOpen}
        onOpenChange={(open) => {
          if (isDeleteCommentPending) {
            return;
          }

          setIsDeleteCommentAlertOpen(open);
          if (!open) {
            setSelectedComment(null);
          }
        }}
      >
        <AlertDialogContent className="max-w-110 rounded-3xl border border-neutral-800 bg-neutral-950 p-5 text-base-pure-white md:p-6">
          <AlertDialogHeader className="text-left">
            <AlertDialogTitle className="text-lg font-bold text-white md:text-xl">
              Hapus komentar ini?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-neutral-400">
              Komentar akan dihapus permanen dan tidak bisa dikembalikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {selectedComment ? (
            <p className="rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-200">
              &ldquo;{selectedComment.content}&rdquo;
            </p>
          ) : null}
          <AlertDialogFooter className="mt-2 gap-3">
            <AlertDialogCancel
              disabled={isDeleteCommentPending}
              className="mt-0 h-10 rounded-full border border-neutral-700 bg-transparent px-5 text-sm font-bold text-white hover:bg-neutral-900 hover:text-white"
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleteCommentPending}
              onClick={(event) => {
                event.preventDefault();
                handleDeleteComment();
              }}
              className="h-10 rounded-full bg-red px-5 text-sm font-bold text-white hover:bg-[#e02c2c]"
            >
              {isDeleteCommentPending ? "Menghapus..." : "Ya, Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
