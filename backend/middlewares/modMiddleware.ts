import { Request, Response, NextFunction } from "express";
import User from "../models/userModel";

export const USER_LEVELS = {
  NORMAL_USER: 0,
  MODERATOR: 1,
};

export const modMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const isMod = await User.is_moderator(res.locals.user.user_id);
    if (isMod) {
      next();
    } else {
      return res.status(304).send({
        status: "error",
        message: "You are not a moderator",
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send({
      status: "error",
      message: "Something went wrong",
    });
  }
};
