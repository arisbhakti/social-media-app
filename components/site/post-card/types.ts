export type PostCardProps = {
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

export type LikeUser = {
  id: number;
  name: string;
  username: string;
  following: boolean;
};

export type CommentItem = {
  id: number;
  name: string;
  content: string;
  createdAt: string;
};
