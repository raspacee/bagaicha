import { z } from "zod";
import { foodItems } from "./config/foods";
import { DAYS } from "./utils/config";

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
  road: z.string().optional(),
  neighbourhood: z.string().min(4),
  city: z.string().min(4),
  state: z.string().min(4),
  openingTime: z.string().time().optional(),
  closingTime: z.string().time().optional(),
  placeFeatures: z.array(placeFeatureSchema).optional(),
  coverImgUrl: z.string().url().optional(),
  foodsOffered: z.array(foodsOfferedSchema).optional(),
  ownedBy: z.string().uuid().optional(),
  createdAt: z.string().datetime(),
  websiteLink: z.string().optional(),
  instagramLink: z.string().optional(),
  contactNumbers: z.array(z.string()).optional(),
});

type Place = z.infer<typeof placeSchema>;

export const createUserSchema = z.object({
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

export type CreateUserForm = z.infer<typeof createUserSchema>;
export const fetchedUserSchema = createUserSchema
  .omit({
    password: true,
  })
  .extend({
    id: z.string().uuid(),
  });
export type FetchedUser = z.infer<typeof fetchedUserSchema>;

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

export const loginFormSchema = createUserSchema.pick({
  email: true,
  password: true,
});

export type LoginForm = z.infer<typeof loginFormSchema>;

export const signupFormSchema = createUserSchema.pick({
  firstName: true,
  lastName: true,
  email: true,
  password: true,
});

export type SignupForm = z.infer<typeof signupFormSchema>;

export const updateProfileFormSchema = createUserSchema
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

export const ownershipRequestSchema = z.object({
  id: z.string().uuid(),
  requestedBy: z.string().uuid(),
  placeId: z.string().uuid(),
  ownershipGranted: z.boolean(),
  documentImageUrl: z.string().url(),
  requestedDate: z.string().datetime(),
});

export type OwnershipRequest = z.infer<typeof ownershipRequestSchema>;

export const ownershipRequestFormSchema = ownershipRequestSchema
  .pick({
    placeId: true,
  })
  .extend({
    documentImageFile: z.instanceof(File, { message: "Image is required" }),
  });
export type OwnershipRequestForm = z.infer<typeof ownershipRequestFormSchema>;

export enum UserModerationLevel {
  OrdinaryUser = 0,
  Moderator,
  Admin,
}
export const editPlaceFormSchema = placeSchema
  .pick({
    name: true,
    placeFeatures: true,
    foodsOffered: true,
    websiteLink: true,
    instagramLink: true,
    contactNumbers: true,
  })
  .extend({
    coverImgUrl: z.string().url().nullable().optional(),
    newCoverImgFile: z
      .instanceof(File, { message: "Image is required" })
      .optional(),
  })
  .refine((data) => data.coverImgUrl || data.newCoverImgFile, {
    message: "Atleast url or new image is required",
    path: ["newCoverImgFile"],
  });

export type EditPlaceForm = z.infer<typeof editPlaceFormSchema>;

export type UserLocation = {
  lat: number;
  lon: number;
};

export type Distance = 1 | 2 | 5 | 10 | null;

export type SearchResultTotalCount = {
  count: number;
};

export type SearchResultsResponse = {
  place: {
    totalItems: number;
    totalPages: number;
    places: Place[];
  };
  post: {
    totalItems: number;
    totalPages: number;
    posts: FeedPost[];
  };
};

export const editPostFormSchema = postSchema.pick({
  body: true,
  rating: true,
});

export type EditPostForm = z.infer<typeof editPostFormSchema>;

export const addPlaceFormSchema = placeSchema
  .pick({
    name: true,
    ownedBy: true,
    placeFeatures: true,
    foodsOffered: true,
  })
  .extend({
    imageFile: z.instanceof(File, { message: "Image is required" }),
    lat: z.string().min(1),
    lon: z.string().min(1),
  });

export type AddPlaceForm = z.infer<typeof addPlaceFormSchema>;

export type CreatePlaceResponse = {
  id: string;
};

export type FetchFeedResponse = {
  posts: FeedPost[];
  nextPage: number | null;
};

export const forgotPasswordFormSchema = z.object({
  email: z.string().email(),
});

export type ForgotPasswordForm = z.infer<typeof forgotPasswordFormSchema>;

export const resetPasswordFormSchema = z
  .object({
    password: z.string().min(6, {
      message: "Password needs to be atleast 6 characters long",
    }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password and Confirm Password needs to be same",
    path: ["confirmPassword"],
  });

export type ResetPasswordForm = z.infer<typeof resetPasswordFormSchema>;

export type ResetPasswordDecoded = {
  id: string;
  email: string;
};

export type OAuth2AccessTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
};

export type PlaceImage = {
  id: string;
  imageUrl: string;
  placeId: string;
  addedBy: string;
  description: string;
  createdAt: string;
  cloudinaryId: string;
};

export const operatingHourSchema = z
  .object({
    openingTime: z.string().time().optional(),
    closingTime: z.string().time().optional(),
    day: z.string(),
    placeId: z.string().uuid(),
  })
  .refine(
    (data) =>
      (data.openingTime && data.closingTime) ||
      (!data.openingTime && !data.closingTime),
    {
      message: "Please provide both opening and closing time",
      path: ["openingTime", "closingTime"],
    }
  )
  .refine((data) => DAYS.includes(data.day), {
    message: "Invalid Day",
    path: ["day"],
  });
export type OperatingHourForm = z.infer<typeof operatingHourSchema>;

export const createPlaceReviewSchema = z.object({
  placeId: z.string().uuid(),
  body: z.string().min(3, { message: "Body should be atleast 3 characters" }),
  rating: z.number().refine((val: number) => [1, 2, 3, 4, 5].includes(val), {
    message: "Provide a valid rating",
  }),
  imageUrl: z.string().url().optional(),
  createdAt: z.string().datetime(),
});
export type CreatePlaceReviewForm = z.infer<typeof createPlaceReviewSchema>;

export const fetchedPlaceReviewSchema = createPlaceReviewSchema.extend({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  helpfulnessCount: z.number(),
});
export type FetchedPlaceReview = z.infer<typeof fetchedPlaceReviewSchema>;
export type FetchedPlaceReviewWithAuthor = FetchedPlaceReview & {
  author: FetchedUser;
};

export type ReviewSortBy = "newest" | "oldest";
export type ReviewFilterBy = "1" | "2" | "3" | "4" | "5" | "all";

export type PlaceWithRating = Place & {
  rating: number | null; // Rating is null when there is no reviews
  totalReviews: number;
};

/* For creation of place feature by admin */
export const createFeatureSchema = z.object({
  featureName: z.string(),
});
export type CreateFeatureForm = z.infer<typeof createFeatureSchema>;

export type FetchedFeature = CreateFeatureForm & {
  id: number;
};

export type {
  JwtUserData,
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
