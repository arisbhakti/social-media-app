export type PostCardProps = {
  postId: number;
  imageSrc: string;
  imageAlt?: string;
  liked?: boolean;
  hasInitialComments?: boolean;
  authorName?: string;
  authorAvatarUrl?: string | null;
  caption?: string;
  createdAtLabel?: string;
  likeCount?: number;
  commentCount?: number;
};

export type CommentItem = {
  id: number;
  name: string;
  content: string;
  createdAt: string;
};
