import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JwtUserData } from "../types";

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
