import express, { Request, Response, NextFunction } from "express";
import Notification from "../models/notificationModel";

const get_notifications = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const notifications = await Notification.get_notifications(
      res.locals.user.user_id,
    );
    return res.status(200).send({
      status: "ok",
      notifications,
    });
  } catch (err) {
    return res.status(500).send({
      status: "error",
      message: err,
    });
  }
};

const read_notification = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await Notification.read_notification(res.locals.user.user_id);
    return res.status(200).send({
      status: "ok",
    });
  } catch (err) {
    return res.status(500).send({
      status: "error",
      message: err,
    });
  }
};

const exporter = {
  get_notifications,
  read_notification,
};

export default exporter;
