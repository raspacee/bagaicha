import { pool } from "../db/index";
import { Notification, NotificationWhole } from "../types";
import { v4 as uuid } from "uuid";

const createNotification = async (notification: Notification) => {
  const id = uuid();
  const text = `
  INSERT INTO "notification" (
    "id", 
    "recipientId", 
    "senderId", 
    "type", 
    "createdAt", 
    "postId", 
    "commentId"
  ) 
  VALUES (
    $1, $2, $3, $4, $5, $6, $7
  );
`;
  const values = [
    id,
    notification.recipientId,
    notification.senderId,
    notification.type,
    new Date().toISOString(),
    notification.postId || null,
    notification.commentId || null,
  ];
  await pool.query(text, values);
};

const getUserNotifications = async (
  userId: string
): Promise<NotificationWhole[]> => {
  const text = `
  SELECT 
    n.*,
    u."firstName" AS "authorFirstName",
    u."lastName" AS "authorLastName", 
    u.email AS "authorEmail", 
    u."profilePictureUrl" AS "authorPictureUrl"
  FROM 
    "notification" AS n
  INNER JOIN 
    "user_" AS u 
  ON 
    n."recipientId" = u.id
  WHERE 
    n."recipientId" = $1 
    AND n."isRead" = false
  ORDER BY 
    n."createdAt" DESC
  LIMIT 
    10;
`;
  const values = [userId];
  const result = await pool.query(text, values);
  if (result.rowCount == 0) return [];
  return result.rows;
};

const readUserNotifications = async (userId: string) => {
  await pool.query(
    `UPDATE "notification" 
     SET "isRead" = true 
     WHERE "recipientId" = $1`,
    [userId]
  );
};

const exporter = {
  createNotification,
  getUserNotifications,
  readUserNotifications,
};

export default exporter;
