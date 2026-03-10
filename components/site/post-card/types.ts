export type PostCardProps = {
  postId: number;
  imageSrc: string;
  imageAlt?: string;
  liked?: boolean;
  saved?: boolean;
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
  username?: string;
  avatarUrl?: string | null;
  content: string;
  createdAt: string;
  isMine?: boolean;
};
