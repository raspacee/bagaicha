import { pool } from "../db/index";
import { Notification } from "../types";

export enum NotificationObject {
  Review = "review",
  Comment = "comment",
}

const create_notification = async (
  actor: string,
  victim: string,
  object_type: NotificationObject,
  object_url: string | null,
  action_type: string
) => {
  const object = await pool.query(
    `insert into notification_object (object_type, object_url) 
values ($1, $2) returning id`,
    [object_type, object_url]
  );
  await pool.query(
    `insert into notification (actor, victim, notification_object_id, action_type, created_at)
values ($1, $2, $3, $4, $5)`,
    [actor, victim, object.rows[0].id, action_type, new Date().toISOString()]
  );
};

const get_notifications = async (
  victim: string
): Promise<Notification[] | null> => {
  const notifications = await pool.query(
    `
    SELECT
      u."firstName" || ' ' || u."lastName" AS "fullName",
      u."profilePictureUrl" AS "userProfilePictureUrl",
      n."actionType",
      no_."objectType",
      no_."objectUrl",
      n."createdAt"
    FROM "notification" AS n
    INNER JOIN "notificationObject" AS no_ ON n."notificationObjectId" = no_."id"
    INNER JOIN "user_" AS u ON u."id" = n."actor"
    WHERE n."victim" = $1 AND n."unread" = true
  `,
    [victim]
  );

  if (notifications.rowCount == 0) return null;
  return notifications.rows;
};

const read_notification = async (victim: string) => {
  await pool.query(
    `update notification set unread=false where unread=true and victim=$1`,
    [victim]
  );
};

const exporter = {
  create_notification,
  get_notifications,
  read_notification,
};

export default exporter;
