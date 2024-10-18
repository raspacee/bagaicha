import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JwtUserData, UserModerationLevel } from "../types";
import UserModel from "../models/user.model";

declare global {
  namespace Express {
    interface Request {
      jwtUserData?: JwtUserData;
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    console.error("Auth missing");
    return res.status(400).send({
      message: "Authentication token missing, try logging in again",
      authenticated: false,
    });
  }

  jwt.verify(token, process.env.JWT_SECRET!, function (err, decoded) {
    if (err) {
      console.error("Auth invalid");
      return res.status(400).send({
        message: "Invalid authentication token, try logging in again",
        authenticated: false,
      });
    }
    req.jwtUserData = decoded as JwtUserData;
    return next();
  });
};

export const optionalAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET!, function (err, decoded) {
    if (err) {
      console.error(err);
      return res.status(400).send({
        message: "Invalid authentication token, try logging in again",
        authenticated: false,
      });
    }
    req.jwtUserData = decoded as JwtUserData;
    return next();
  });
};

export const verifyAdminMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await UserModel.getDataById(req.jwtUserData!.userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.moderationLvl == UserModerationLevel.Admin) {
      return next();
    } else {
      return res.status(401).json();
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Error while verifying admin",
    });
  }
};
