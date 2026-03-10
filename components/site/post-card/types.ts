export type PostCardProps = {
  imageSrc: string;
  imageAlt: string;
  liked?: boolean;
  hasInitialComments?: boolean;
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
