export type Media = {
  url: string;
  publicId: string;
  type: "image" | "video";
  width?: number;
  height?: number;
  duration?: number;
};

export type PostUser = {
  _id: string;
  name: string;
  avatarUrl?: string;
};

export type CommentWithUser = {
  _id: string;
  content: string;
  user: PostUser;
  createdAt: string;
};

export type PostWithUser = {
  _id: string;
  content: string;
  user: PostUser;
  media: Media[];
  likes: string[];
  comments: CommentWithUser[];
  createdAt: string;
};
