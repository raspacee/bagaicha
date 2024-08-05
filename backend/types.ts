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
  author_name: string;
  author_profile_picture_url: string;
  author_email: string;
  place_lat: number;
  place_long: number;
  place_name: string;
  place_openmaps_place_id: string;
  user_has_liked: boolean;
  user_has_bookmarked: boolean;

  comments: Comment[];
};

type Post = {
  id: string;
  author_id: string;
  body: string;
  picture: string;
  like_count: number;
  place_id: string;
  created_at: string;
  rating: number;
};

export type {
  JwtUserData,
  User,
  Notification,
  Post,
  Comment,
  PostWithComments,
};
