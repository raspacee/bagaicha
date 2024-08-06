import express, { Request, Response, NextFunction } from "express";
import Notification from "../models/notificationModel";

const get_notifications = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const notifications = await Notification.get_notifications(
      req.jwtUserData!.userId
    );
    return res.status(200).json(notifications);
  } catch (err) {
    console.error(err);
    return res.status(500).send({
      message: err,
    });
  }
};

const read_notification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await Notification.read_notification(req.jwtUserData!.userId);
    return res.json();
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
