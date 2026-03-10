"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { EmojiStyle, Theme, type EmojiClickData } from "emoji-picker-react";

import {
  IoBookmarkOutline,
  IoChatbubbleOutline,
  IoClose,
  IoEllipsisHorizontal,
  IoHappyOutline,
  IoHeart,
  IoHeartOutline,
  IoPaperPlaneOutline,
} from "react-icons/io5";

import { useIsMobile } from "@/hooks/use-mobile";
import { ActionButton } from "@/components/site/post-card/action-button";
import { CommentRow } from "@/components/site/post-card/comment-row";
import {
  DEFAULT_COMMENTS,
  POST_CAPTION,
} from "@/components/site/post-card/constants";
import { LikesList } from "@/components/site/post-card/likes-list";
import { ModalActionStat } from "@/components/site/post-card/modal-action-stat";
import type {
  CommentItem,
  PostCardProps,
} from "@/components/site/post-card/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

const EmojiPicker = dynamic(
  () => import("emoji-picker-react").then((mod) => mod.default),
  { ssr: false },
);

export function PostCard({
  imageSrc,
  imageAlt,
  liked = false,
  hasInitialComments = false,
}: PostCardProps) {
  const [isLikesOpen, setIsLikesOpen] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [comments, setComments] = useState<CommentItem[]>(() =>
    hasInitialComments ? [...DEFAULT_COMMENTS] : [],
  );
  const [nextCommentId, setNextCommentId] = useState(
    hasInitialComments ? DEFAULT_COMMENTS.length + 1 : 1,
  );
  const emojiPickerRef = useRef<HTMLDivElement | null>(null);
  const emojiButtonRef = useRef<HTMLButtonElement | null>(null);
  const isMobile = useIsMobile();
  const isPostDisabled = commentInput.trim().length === 0;

  const handleOpenComments = () => {
    setIsCommentsOpen(true);
  };

  const handleCommentsOpenChange = (open: boolean) => {
    setIsCommentsOpen(open);

    if (!open) {
      setIsEmojiPickerOpen(false);
    }
  };

  const handleSubmitComment = () => {
    const trimmedComment = commentInput.trim();

    if (!trimmedComment) {
      return;
    }

    setComments((prevComments) => [
      ...prevComments,
      {
        id: nextCommentId,
        name: "You",
        content: trimmedComment,
        createdAt: "Just now",
      },
    ]);
    setNextCommentId((value) => value + 1);
    setCommentInput("");
    setIsEmojiPickerOpen(false);
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setCommentInput((prevValue) => `${prevValue}${emojiData.emoji}`);
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

  const commentsContent = comments.length === 0 && (
    <div className="flex min-h-[220px] flex-1 flex-col items-center justify-center text-center">
      <h3 className="text-[24px] leading-[28px] font-bold text-[var(--base-pure-white)]">
        No Comments yet
      </h3>
      <p className="mt-1 text-[14px] leading-[20px] text-[var(--neutral-500)]">
        Start the conversation
      </p>
    </div>
  );

  return (
    <>
      <Card className="gap-3 rounded-none border-0 bg-transparent py-0 text-white shadow-none">
        <div className="flex items-center gap-2 md:gap-3">
          <Avatar className="size-11 md:size-16 border border-[rgba(126,145,183,0.32)]">
            <AvatarImage src="/dummy-profile-image.png" alt="Johndoe" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div className="grid gap-0">
            <span className="text-sm md:text-md font-bold">Johndoe</span>
            <span className="text-xs md:text-sm text-neutral-400">
              1 Minutes Ago
            </span>
          </div>
        </div>

        <div className="w-full overflow-hidden rounded-xl">
          <Image
            src={imageSrc}
            alt={imageAlt}
            width={1000}
            height={1000}
            className="md:h-150 aspect-square w-full object-cover"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <ActionButton
              label="Open likes list"
              count={20}
              onClick={() => setIsLikesOpen(true)}
              icon={
                liked ? (
                  <IoHeart className="size-6 text-red" />
                ) : (
                  <IoHeartOutline className="size-6" />
                )
              }
            />
            <ActionButton
              label="Open comments"
              count={20}
              onClick={handleOpenComments}
              icon={<IoChatbubbleOutline className="size-6" />}
            />
            <ActionButton
              label="Share post"
              count={20}
              icon={<IoPaperPlaneOutline className="size-6" />}
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Save post"
            className="size-5 rounded-none p-0 text-[var(--base-pure-white)] hover:bg-transparent"
          >
            <IoBookmarkOutline className="size-6" />
          </Button>
        </div>

        <div className="grid gap-0 md:gap-1">
          <span className="text-sm md:text-md font-bold">Johndoe</span>
          <p className="text-sm md:text-md text-neutral-25">
            Creating unforgettable moments with my favorite person! Let&apos;s
            cherish every second together! ...
          </p>
          <Button
            type="button"
            variant="link"
            className="h-auto w-fit p-0 text-sm md:text-md font-bold text-primary-200"
          >
            Show More
          </Button>
        </div>
      </Card>

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
                className="absolute -top-8 right-4 z-20 size-6 rounded-full p-0 text-[var(--base-pure-white)] hover:bg-transparent"
              >
                <IoClose className="size-6" />
              </Button>

              <LikesList />
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={isLikesOpen} onOpenChange={setIsLikesOpen}>
          <DialogContent
            showCloseButton={false}
            className="w-[548px]! border-0 bg-neutral-950 p-0 text-neutral-25 "
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
              <LikesList />
            </div>
          </DialogContent>
        </Dialog>
      )}

      {isMobile ? (
        <Drawer open={isCommentsOpen} onOpenChange={handleCommentsOpenChange}>
          <DrawerContent className="[&>div:first-child]:hidden max-h-[72vh] border-t border-t-[rgba(126,145,183,0.2)] bg-neutral-950 p-0 text-[var(--base-pure-white)]">
            <DrawerTitle className="sr-only">Comments</DrawerTitle>
            <div className="relative flex min-h-0 flex-1 flex-col px-4 pt-4 pb-4">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Close comments"
                onClick={() => handleCommentsOpenChange(false)}
                className="absolute -top-10 right-4 z-20 size-6 rounded-full p-0 text-[var(--base-pure-white)] hover:bg-transparent"
              >
                <IoClose className="size-6" />
              </Button>

              <h2 className="text-md font-bold text-[var(--base-pure-white)]">
                Comments
              </h2>

              <div className="mt-4 flex min-h-0 flex-1 flex-col overflow-y-auto">
                {comments.length === 0 ? (
                  commentsContent
                ) : (
                  <div className="grid gap-4 pr-1">
                    {comments.map((comment) => (
                      <CommentRow key={comment.id} item={comment} />
                    ))}
                  </div>
                )}
              </div>

              <div className="relative mt-4">
                {isEmojiPickerOpen ? (
                  <div
                    ref={emojiPickerRef}
                    className="absolute bottom-[calc(100%+10px)] left-0 z-30 overflow-hidden rounded-[12px] border border-[rgba(126,145,183,0.24)] shadow-[0_16px_34px_rgba(0,0,0,0.5)]"
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

                <div className="flex items-center gap-2">
                  <Button
                    ref={emojiButtonRef}
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Add emoji"
                    onClick={() => setIsEmojiPickerOpen((value) => !value)}
                    className="size-12 rounded-[14px] border border-[rgba(126,145,183,0.2)] p-0 text-[var(--base-pure-white)] hover:bg-transparent"
                  >
                    <IoHappyOutline className="size-6" />
                  </Button>

                  <div className="flex h-12 flex-1 items-center rounded-[14px] border border-[rgba(126,145,183,0.2)] bg-transparent px-3">
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
                      className="h-full min-w-0 flex-1 bg-transparent text-[15px] leading-[20px] text-[var(--base-pure-white)] outline-none placeholder:text-[var(--neutral-500)]"
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleSubmitComment}
                      disabled={isPostDisabled}
                      className={cn(
                        "h-auto rounded-none p-0 text-[16px] leading-[20px] font-semibold hover:bg-transparent",
                        isPostDisabled
                          ? "text-[var(--neutral-500)]"
                          : "text-[var(--primary-200)] hover:text-[var(--primary-200)]",
                      )}
                    >
                      Post
                    </Button>
                  </div>
                </div>
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
                    <Image
                      src={imageSrc}
                      alt={imageAlt}
                      fill
                      sizes="(max-width: 1200px) 60vw, 720px"
                      className="object-cover"
                    />
                  </div>

                  <div className="flex min-h-0 flex-col bg-neutral-950 p-5 ">
                    <div className="border-b border-b-neutral-900 pb-4 flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-10 ">
                            <AvatarImage
                              src="/dummy-profile-image.png"
                              alt="John Doe"
                            />
                            <AvatarFallback>JD</AvatarFallback>
                          </Avatar>
                          <div className="grid gap-0.5">
                            <span className="text-sm font-bold">John Doe</span>
                            <span className="text-xs text-neutral-400">
                              1 Minutes Ago
                            </span>
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label="More options"
                          className="size-6 rounded-full p-0 hover:bg-transparent"
                        >
                          <IoEllipsisHorizontal className="size-6" />
                        </Button>
                      </div>

                      <p className="text-sm text-neutral-25">{POST_CAPTION}</p>
                    </div>

                    <div className="mt-5 flex min-h-0 flex-1 flex-col">
                      <h2 className="text-md font-bold text-neutral-25">
                        Comments
                      </h2>

                      <div className="mt-5 flex min-h-0 flex-1 flex-col overflow-y-auto">
                        {comments.length === 0 ? (
                          commentsContent
                        ) : (
                          <div className="grid gap-4 pr-1">
                            {comments.map((comment) => (
                              <CommentRow key={comment.id} item={comment} />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 border-t border-t-neutral-900 pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <ModalActionStat
                            label="Total likes"
                            count={20}
                            icon={<IoHeart className="size-6 text-red" />}
                          />
                          <ModalActionStat
                            label="Total comments"
                            count={20}
                            icon={<IoChatbubbleOutline className="size-6" />}
                          />
                          <ModalActionStat
                            label="Total shares"
                            count={20}
                            icon={<IoPaperPlaneOutline className="size-6" />}
                          />
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Save post"
                          className="size-6 rounded-none p-0 text-white"
                        >
                          <IoBookmarkOutline className="size-6" />
                        </Button>
                      </div>

                      <div className="relative mt-4">
                        {isEmojiPickerOpen ? (
                          <div
                            ref={emojiPickerRef}
                            className="absolute bottom-[calc(100%+10px)] left-0 z-30 overflow-hidden rounded-[12px] border border-[rgba(126,145,183,0.24)] shadow-[0_16px_34px_rgba(0,0,0,0.5)]"
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

                          <div className="flex h-12 flex-1 items-center rounded-[14px] border border-neutral-900 bg-neutral-950 px-4 py-2">
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
                              className="h-full min-w-0 flex-1 bg-transparent text-md text-white outline-none placeholder:text-neutral-600 font-medium"
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
                              Post
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
