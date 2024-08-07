import { Request, Response, NextFunction } from "express";
import NotificationModel from "../models/notification.model";

const getNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const notifications = await NotificationModel.getUserNotifications(
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

const readNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await NotificationModel.readUserNotifications(req.jwtUserData!.userId);
    return res.send();
  } catch (err) {
    return res.status(500).send({
      status: "error",
      message: err,
    });
  }
};

const exporter = {
  getNotifications,
  readNotifications,
};

export default exporter;
