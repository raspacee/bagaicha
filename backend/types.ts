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

export type { JwtUserData, User };
