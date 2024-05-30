import { pool } from "../db/index";

const get_history = async (user_id: string) => {
  const text = `select * from search where user_id=$1 order by created_at desc limit 5`;
  const data = await pool.query(text, [user_id]);
  if (data.rowCount == 0) return null;
  return data.rows;
};

const delete_history = async (user_id: string) => {
  const text = `delete from search where user_id=$1`;
  await pool.query(text, [user_id]);
};

const add_to_history = async (user_id: string, query: string) => {
  const duplicate = await pool.query(
    `select count(*) as count from search where query=$1`,
    [query],
  );
  if (duplicate.rows[0].count > 0) {
    return;
  }
  const text = `insert into search (user_id, query, created_at) values ($1, $2, $3)`;
  const values = [user_id, query, new Date().toISOString()];
  await pool.query(text, values);
};

const exporter = {
  get_history,
  delete_history,
  add_to_history,
};

export default exporter;
