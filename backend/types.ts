import { z } from "zod";
import { foodItems } from "./config/foods";

type JwtUserData = {
  userId: string;
  email: string;
};

type PostWithComments = FeedPost & {
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

const commentSchema = z.object({
  id: z.string().uuid(),
  postId: z.string().uuid(),
  authorId: z.string().uuid(),
  body: z.string().min(1).max(500),
  createdAt: z.string().datetime(),
  likeCount: z.number().default(0),
});

type Comment = z.infer<typeof commentSchema>;

type CommentWhole = Comment & {
  authorFirstName: string;
  authorLastName: string;
  authorEmail: string;
  authorPictureUrl: string;
  hasLiked: boolean;
};

export const commentFormSchema = z.object({
  postId: z.string().min(1),
  body: z.string().min(1).max(500),
});

type CommentForm = z.infer<typeof commentFormSchema>;

export const daySchema = z.enum([
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
]);

type Day = z.infer<typeof daySchema>;

export const placeFeatureSchema = z.enum([
  "Offers Delivery",
  "Offers Takeout",
  "Pet Friendly",
  "Very Clean",
  "Affordable",
]);

type PlaceFeature = z.infer<typeof placeFeatureSchema>;

export const foodsOfferedSchema = z.enum(foodItems);

type FoodsOffered = z.infer<typeof foodsOfferedSchema>;

const placeSchema = z.object({
  id: z.string().uuid(),
  osmId: z.string().max(20),
  name: z.string().min(2).max(250),
  lat: z.number(),
  lon: z.number(),
  openDays: z.array(daySchema).optional(),
  openingTime: z.string().time().optional(),
  closingTime: z.string().time().optional(),
  placeFeatures: z.array(placeFeatureSchema).optional(),
  coverImgUrl: z.string().url().optional(),
  foodsOffered: z.array(foodsOfferedSchema).optional(),
  ownedBy: z.string().uuid().optional(),
  createdAt: z.string().datetime(),
});

type Place = z.infer<typeof placeSchema>;

export const userSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string().max(50),
  lastName: z.string().max(50),
  password: z.string().max(50),
  email: z.string().email(),
  createdAt: z.string().datetime(),
  profilePictureUrl: z.string().url(),
  moderationLvl: z.number().default(0),
  bio: z.string().max(500),
});

type User = z.infer<typeof userSchema>;

const notificationTypesSchema = z.enum([
  "UserLikesPost",
  "UserLikesComment",
  "UserCommentsOnPost",
]);
type NotificationTypes = z.infer<typeof notificationTypesSchema>;

export const notificationSchema = z.object({
  id: z.string().uuid().optional(),
  recipientId: z.string().uuid(),
  senderId: z.string().uuid(),
  postId: z.string().uuid().optional(),
  commentId: z.string().uuid().optional(),
  type: notificationTypesSchema,
  isRead: z.boolean().default(false),
  createdAt: z.string().datetime().optional(),
});

type Notification = z.infer<typeof notificationSchema>;

type NotificationWhole = Notification & {
  authorFirstName: string;
  authorLastName: string;
  authorEmail: string;
  authorPictureUrl: string;
};

export type {
  JwtUserData,
  User,
  Comment,
  CommentWhole,
  Post,
  PostWithComments,
  FeedPost,
  CreatePostForm,
  CommentForm,
  Place,
  FoodsOffered,
  Day,
  PlaceFeature,
  NotificationTypes,
  Notification,
  NotificationWhole,
};
