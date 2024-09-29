import { Request, Response, NextFunction } from "express";
import User from "../models/user.model";

export const USER_LEVELS = {
  NORMAL_USER: 0,
  MODERATOR: 2,
};

export const modMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const isMod = await User.is_moderator(req.jwtUserData!.userId);
    if (isMod) {
      next();
    } else {
      return res.status(403).json({
        message: "You are not a moderator",
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};
