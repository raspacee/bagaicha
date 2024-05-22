import { pool } from "../db/index";
import { USER_LEVELS } from "../middlewares/modMiddleware";

const is_moderator = async (id: string) => {
  const text = `select moderation_lvl from user_ where id=$1`;
  const values = [id];
  const data = await pool.query(text, values);
  if (data.rows[0]?.moderation_lvl == USER_LEVELS.MODERATOR) {
    return true;
  }
  return false;
};

const create_user = async (
  id: string,
  email: string,
  first_name: string,
  last_name: string,
  password: string,
  created_at: string,
  profile_picture_url: string,
) => {
  const text =
    "insert into user_ (id, email, first_name, last_name, password, \
    created_at, profile_picture_url) values ($1, $2, $3, $4, $5, $6, $7)";
  const values = [
    id,
    email,
    first_name,
    last_name,
    password,
    created_at,
    profile_picture_url,
  ];
  return pool.query(text, values);
};

const get_user_all_info = async (email: string) => {
  const text = "select * from user_ where email=$1;";
  const values = [email];
  const user = await pool.query(text, values);
  if (user.rowCount == 0) return null;
  return user.rows[0];
};

const change_profile_pic_url = async (user_id: string, new_url: string) => {
  await pool.query(
    "update user_ set profile_picture_url = $1 \
    where id = $2;",
    [new_url, user_id],
  );
};

const exporter = {
  create_user,
  get_user_all_info,
  change_profile_pic_url,
  is_moderator,
};

export default exporter;
