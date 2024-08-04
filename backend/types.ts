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

export type { JwtUserData, User, Notification };
