import { pool } from "../db/index";

export enum NotificationObject {
  Review = "review",
  Comment = "comment",
}

const create_notification = async (
  actor: string,
  victim: string,
  object_type: NotificationObject,
  object_url: string | null,
  action_type: string,
) => {
  const object = await pool.query(
    `insert into notification_object (object_type, object_url) 
values ($1, $2) returning id`,
    [object_type, object_url],
  );
  await pool.query(
    `insert into notification (actor, victim, notification_object_id, action_type, created_at)
values ($1, $2, $3, $4, $5)`,
    [actor, victim, object.rows[0].id, action_type, new Date().toISOString()],
  );
};

const get_notifications = async (victim: string) => {
  const notifications = await pool.query(
    ` select u.first_name || ' ' || u.last_name as actor, u.profile_picture_url as actor_picture, 
n.action_type, no_.object_type, no_.object_url, n.created_at from notification as n 
	inner join notification_object as no_ on n.notification_object_id = no_.id
	inner join user_ as u on u.id = n.actor
	where victim=$1 and unread=true
`,
    [victim],
  );
  if (notifications.rowCount == 0) return null;
  return notifications.rows;
};

const read_notification = async (victim: string) => {
  await pool.query(
    `update notification set unread=false where unread=true and victim=$1`,
    [victim],
  );
};

const exporter = {
  create_notification,
  get_notifications,
  read_notification,
};

export default exporter;
