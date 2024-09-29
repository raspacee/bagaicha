import { pool } from "../db/index";
import { USER_LEVELS } from "../middlewares/modMiddleware";
import { SignupForm, UpdateProfileForm, User } from "../types";
import { v4 as uuid } from "uuid";

const is_moderator = async (id: string) => {
  const text = `SELECT "moderationLvl" FROM user_ WHERE id=$1`;
  const values = [id];
  const data = await pool.query(text, values);
  if (data.rows[0]?.moderationLvl == USER_LEVELS.MODERATOR) {
    return true;
  }
  return false;
};

const createUser = async (
  data: SignupForm,
  profilePictureUrl: string,
  isOAuth2: boolean = false
): Promise<User> => {
  const id = uuid();
  const createdAt = new Date().toISOString();

  const text = `
  INSERT INTO "user_" (
    "id",
    "email",
    "firstName",
    "lastName",
    "password",
    "createdAt",
    "profilePictureUrl",
    "isOAuth2Account"
  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
   RETURNING *;
`;

  const values = [
    id,
    data.email,
    data.firstName,
    data.lastName,
    data.password,
    createdAt,
    profilePictureUrl,
    isOAuth2,
  ];
  const result = await pool.query(text, values);
  return result.rows[0];
};

const change_profile_pic_url = async (user_id: string, new_url: string) => {
  await pool.query(
    "update user_ set profile_picture_url = $1 \
    where id = $2;",
    [new_url, user_id]
  );
};

const updateProfileInfo = async (
  userId: string,
  formData: UpdateProfileForm
) => {
  const text = `
  UPDATE "user_" 
  SET 
    "firstName" = $1,
    "lastName" = $2,
    "bio" = $3,
    "profilePictureUrl" = $4
  WHERE "id" = $5;
  `;
  const values = [
    formData.firstName,
    formData.lastName,
    formData.bio,
    formData.profilePictureUrl,
    userId,
  ];
  await pool.query(text, values);
};

const getDataById = async (userId: string): Promise<User | null> => {
  const text = `
  SELECT 
    "id",
    "firstName",
    "lastName",
    "profilePictureUrl",
    "bio",
    "moderationLvl",
    "email",
    "createdAt"
  FROM "user_"
  WHERE "id" = $1;
`;
  const values = [userId];
  const result = await pool.query(text, values);
  if (result.rowCount == 0) {
    return null;
  }
  return result.rows[0] as User;
};

const getDataByEmail = async (email: string): Promise<User | null> => {
  const text = `
  SELECT 
    "id",
    "firstName",
    "lastName",
    "profilePictureUrl",
    "bio",
    "moderationLvl",
    "email"
  FROM "user_"
  WHERE "email" = $1;
`;
  const values = [email];
  const result = await pool.query(text, values);
  if (result.rowCount == 0) {
    return null;
  }
  return result.rows[0] as User;
};

const getPasswordByEmail = async (email: string): Promise<User | null> => {
  const text = `
  SELECT 
    "id",
    "email",
    "password"
  FROM "user_"
  WHERE "email" = $1;
`;
  const values = [email];
  const result = await pool.query(text, values);
  if (result.rowCount == 0) {
    return null;
  }
  return result.rows[0] as User;
};

const changePassword = async (userId: string, newPassword: string) => {
  const text = `
  UPDATE "user_"
  SET "password" = $1
  WHERE "id" = $2
  `;
  const values = [newPassword, userId];
  await pool.query(text, values);
};

const exporter = {
  createUser,
  change_profile_pic_url,
  is_moderator,
  updateProfileInfo,
  getDataById,
  getDataByEmail,
  getPasswordByEmail,
  changePassword,
};

export default exporter;
