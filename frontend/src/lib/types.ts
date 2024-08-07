import { foodItems } from "@/config/foods";
import { z } from "zod";

/* User type when logged in */
type UserInterface = {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_picture_url: string;
};

type LocationType = {
  lat: number;
  long: number;
};

type AddPlaceType = {
  relation: null | "owner" | "customer";
  placeName: string;
  placeLat: string;
  placeLong: string;
  foods: string[];
  drinks: string[];
  displayPic: File | null;
  alcoholAllowed: boolean;
};

type ModalType = {
  imgModal: {
    display: boolean;
    src: string;
  };
  searchModal: {
    display: boolean;
  };
  postCreateModal: {
    display: boolean;
  };
  reviewModal: {
    reviewId: string | null;
    reviewImageUrl: string;
    reviewBody: string;
    authorName: string;
    authorImageUrl: string;
    authorEmail: string;
    createdAt: string;
    placeName: string;
    placeId: string;
    rating: number;
  };
};

type FilterType = {
  suggested: {
    delivery: boolean;
    takeout: boolean;
    petFriendly: boolean;
    veryClean: boolean;
    affordable: boolean;
  };
  category: {
    burger: boolean;
    sekuwa: boolean;
    momo: boolean;
    lafing: boolean;
    coffee: boolean;
  };
  distance: {
    distancePicked: any;
  };
};

type FetchOptionType = {
  method: "post" | "get" | "put";
  body?: string;
  headers?: {
    "content-type"?: string;
    authorization?: string;
  };
};

type PostWithComments = FeedPost & {
  comments: CommentWhole[];
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

const daySchema = z.enum([
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
]);

export type Day = z.infer<typeof daySchema>;

const placeFeatureSchema = z.enum([
  "Offers Delivery",
  "Offers Takeout",
  "Pet Friendly",
  "Very Clean",
  "Affordable",
]);

export type PlaceFeature = z.infer<typeof placeFeatureSchema>;

const foodsOfferedSchema = z.enum(foodItems);

export type FoodsOffered = z.infer<typeof foodsOfferedSchema>;

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

export type Place = z.infer<typeof placeSchema>;

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

export const userSchema = z.object({
  id: z.string().uuid(),
  firstName: z
    .string()
    .min(2, {
      message: "At least 2 characters required",
    })
    .max(20),
  lastName: z
    .string()
    .min(2, {
      message: "At least 2 characters required",
    })
    .max(20),
  password: z
    .string()
    .min(6, { message: "Password should be atleast 6 characters" })
    .max(50),
  email: z.string().min(1).email("Valid email is required"),
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

type LoginResponse = {
  token: string;
};

export const loginFormSchema = userSchema.pick({
  email: true,
  password: true,
});

export type LoginForm = z.infer<typeof loginFormSchema>;

export const signupFormSchema = userSchema.pick({
  firstName: true,
  lastName: true,
  email: true,
  password: true,
});

export type SignupForm = z.infer<typeof signupFormSchema>;

export const updateProfileFormSchema = userSchema
  .pick({
    firstName: true,
    lastName: true,
    bio: true,
    profilePictureUrl: true,
  })
  .extend({
    profilePictureUrl: z.string().url().optional(),
    newProfilePictureImage: z
      .instanceof(File, { message: "Image is required" })
      .optional(),
  })
  .refine((data) => data.newProfilePictureImage || data.profilePictureUrl, {
    message: "Either image URL or file is required",
    path: ["newProfilePictureImage"],
  });

export type UpdateProfileForm = z.infer<typeof updateProfileFormSchema>;

export type {
  UserInterface,
  LocationType,
  FetchOptionType,
  Notification,
  FilterType,
  AddPlaceType,
  ModalType,
  FeedPost,
  Post,
  PostWithComments,
  Comment,
  CommentWhole,
  CommentForm,
  User,
  NotificationTypes,
  NotificationWhole,
  LoginResponse,
};
