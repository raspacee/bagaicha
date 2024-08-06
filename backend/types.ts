import { z } from "zod";

type JwtUserData = {
  userId: string;
  email: string;
};

type User = {
  id: string;
  first_name: string;
  last_name: string;
  profile_picture_url: string;
  moderation_lvl: string;
  email: string;
};

type Notification = {
  fullname: string;
  user_profile_picture_url: string;
  action_type: string;
  object_type: string;
  object_url: string;
  created_at: string;
};

type Comment = {
  id: number;
  review_id: string;
  author_id: string;
  body: string;
  created_at: string;
  like_count: string;
  author_name: string;
  author_email: string;
  author_picture_url: string;
  has_liked_comment: boolean;
};

type PostWithComments = Post & {
  comments: Comment[];
};

export const postSchema = z.object({
  id: z.string().uuid(),
  authorId: z.string().uuid(),
  body: z.string().min(1).max(500),
  imageUrl: z.string().url(),
  likeCount: z.number().default(0),
  placeId: z.string().uuid(),
  rating: z.number().min(1).max(5),
  createdAt: z.string().datetime(),
});

type Post = z.infer<typeof postSchema>;

type FeedPost = Post & {
  score: number;
  authorFirstName: string;
  authorLastName: string;
  authorEmail: string;
  authorPictureUrl: string;
  hasLiked: boolean;
  hasBookmarked: boolean;
  placeName: string;
  lat: number;
  lon: number;
};

type CreatePostForm = {
  placeName: string;
  placeId: string;
  rating: number;
  body: string;
  image: File;
};

export type {
  JwtUserData,
  User,
  Notification,
  Post,
  Comment,
  PostWithComments,
  FeedPost,
  CreatePostForm,
};
